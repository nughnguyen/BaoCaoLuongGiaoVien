import { createClient } from "@/lib/supabase/server";
import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import path from "path";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const monthKey = searchParams.get("month_key");
  const customFilename = searchParams.get("filename");

  if (!monthKey) {
    return NextResponse.json(
      { error: "Thiếu tham số month_key (MM-YYYY)." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch profile for bank info
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, bank_name, bank_account_name, bank_account_number")
    .eq("id", user.id)
    .single();

  const { data: rows, error } = await supabase
    .from("attendance_logs")
    .select("date, duration, total_earned, status, classes (class_name, student_name, teacher_name, branch_name, student_count, program_details, schedule_details)")
    .eq("user_id", user.id)
    .eq("month_key", monthKey)
    .order("date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  type ExportRow = {
    date: string;
    duration: number;
    total_earned: number;
    status: string;
    classes: { 
      class_name: string; 
      student_name: string; 
      teacher_name: string;
      branch_name: string;
      student_count: number;
      program_details: string | null;
      schedule_details: any[];
    } | null;
  };

  const sessions = (rows ?? []) as unknown as ExportRow[];

  const workbook = new ExcelJS.Workbook();
  const templatePath = path.join(process.cwd(), "public", "ExcelTemplate", "[TÊN TRUNG TÂM] - [TÊN GIÁO VIÊN] - BÁO CÁO LƯƠNG THÁNG [THÁNG].[NĂM].xlsx");
  
  try {
    await workbook.xlsx.readFile(templatePath);
  } catch (err) {
    console.error("Error reading template:", err);
    return NextResponse.json({ error: "Không tìm thấy file mẫu Excel." }, { status: 500 });
  }

  const templateSheet = workbook.getWorksheet("TÊN CHI NHÁNH") || workbook.getWorksheet(2);
  const totalSheet = workbook.getWorksheet("TOTAL") || workbook.getWorksheet(1);

  // Group by branch
  const branchMap = new Map<string, ExportRow[]>();
  for (const s of sessions) {
    const bName = s.classes?.branch_name || "Cơ bản";
    if (!branchMap.has(bName)) branchMap.set(bName, []);
    branchMap.get(bName)!.push(s);
  }

  let grandTotal = 0;

  for (const [branchName, branchSessions] of branchMap.entries()) {
    if (!templateSheet) continue;

    const sheet = workbook.addWorksheet(branchName);
    const templateModel = JSON.parse(JSON.stringify(templateSheet.model));
    templateModel.name = branchName;
    templateModel.id = sheet.id;
    sheet.model = templateModel;

    const sampleRow = templateSheet.getRow(2);

    const defaultFont: Partial<ExcelJS.Font> = { name: 'Tahoma' };

    let branchTotalAmount = 0;
    let rowIdx = 2;
    for (const s of branchSessions) {
      const date = new Date(s.date);
      const row = sheet.getRow(rowIdx);
      
      if (rowIdx > 2) {
        sampleRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          row.getCell(colNumber).style = cell.style;
        });
      }

      // Find time slot for this day
      const dayOfWeek = date.getDay();
      const sched = s.classes?.schedule_details?.find(d => d.day === dayOfWeek);
      const timeSlot = sched ? `${sched.start_time} - ${sched.end_time}` : "";

      const c1 = row.getCell(1); c1.value = date.getDate(); c1.font = defaultFont;
      const c2 = row.getCell(2); c2.value = date.getMonth() + 1; c2.font = defaultFont;
      const c3 = row.getCell(3); c3.value = date.getFullYear(); c3.font = defaultFont;
      const c4 = row.getCell(4); c4.value = timeSlot; c4.font = defaultFont;
      const c5 = row.getCell(5); c5.value = s.classes?.teacher_name ?? ""; c5.font = defaultFont;
      const c6 = row.getCell(6); c6.value = s.classes?.student_count ?? 1; c6.font = defaultFont;
      const c7 = row.getCell(7); c7.value = s.classes?.student_name ?? ""; c7.font = defaultFont;
      const c8 = row.getCell(8); c8.value = s.classes?.class_name ?? ""; c8.font = defaultFont;
      const c9 = row.getCell(9); c9.value = Number(s.duration); c9.font = defaultFont;
      const c10 = row.getCell(10); c10.value = s.classes ? (Number(s.total_earned) / Number(s.duration)) : 0; c10.font = defaultFont;
      const c11 = row.getCell(11); c11.value = Number(s.total_earned); c11.font = defaultFont;
      
      branchTotalAmount += Number(s.total_earned);
      grandTotal += Number(s.total_earned);
      row.commit();
      rowIdx++;
    }

    // Apply borders ONLY to M2 and M3 (Summary area)
    const borderStyle: Partial<ExcelJS.Borders> = {
      top: { style: 'thin' as ExcelJS.BorderStyle },
      left: { style: 'thin' as ExcelJS.BorderStyle },
      bottom: { style: 'thin' as ExcelJS.BorderStyle },
      right: { style: 'thin' as ExcelJS.BorderStyle }
    };

    // Clear borders for columns L to R for all rows (including empty ones)
    ["L", "M", "N", "O", "P", "Q", "R"].forEach(col => {
      const column = sheet.getColumn(col);
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        cell.border = {};
      });
    });

    const m2 = sheet.getCell("M2");
    const m3 = sheet.getCell("M3");
    
    m2.border = borderStyle;
    m2.font = defaultFont;
    m3.border = borderStyle;
    m3.font = defaultFont;

    // Set M3 value as the calculated branch total and format as currency
    m3.numFmt = '#,##0"đ"';
    m3.value = branchTotalAmount;

    // Auto-fit columns (approximation)
    sheet.columns.forEach(column => {
      let maxColumnLength = 0;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 0;
        if (columnLength > maxColumnLength) {
          maxColumnLength = columnLength;
        }
      });
      column.width = maxColumnLength < 10 ? 10 : maxColumnLength + 2;
    });
  }

  // Remove the template sheet itself after cloning all needed sheets
  if (templateSheet && branchMap.size > 0) {
    workbook.removeWorksheet(templateSheet.id);
  }

  if (totalSheet) {
    const borderStyle: Partial<ExcelJS.Borders> = {
      top: { style: 'thin' as ExcelJS.BorderStyle },
      left: { style: 'thin' as ExcelJS.BorderStyle },
      bottom: { style: 'thin' as ExcelJS.BorderStyle },
      right: { style: 'thin' as ExcelJS.BorderStyle }
    };

    // Clear A1, A2 borders
    totalSheet.getCell("A1").border = {};
    totalSheet.getCell("A2").border = {};

    // Borders for B1, C1, D1, E2, E3
    ["B1", "C1", "D1", "E2", "E3"].forEach(cellId => {
      totalSheet.getCell(cellId).border = borderStyle;
    });

    // Borders for B15:D17
    for (let r = 15; r <= 17; r++) {
      ["B", "C", "D"].forEach(col => {
        totalSheet.getCell(`${col}${r}`).border = borderStyle;
      });
    }

    // Fill branch summary in TOTAL sheet
    const branches = Array.from(branchMap.keys());
    const currencyFmt = '#,##0"đ"';
    let lastBranchRow = 1; // Assuming row 1 is header
    const defaultFontTotal: Partial<ExcelJS.Font> = { name: 'Tahoma' };

    branches.forEach((branchName, i) => {
      const rowNum = 2 + i;
      const branchSessions = branchMap.get(branchName) || [];
      const branchTotal = branchSessions.reduce((sum, s) => sum + Number(s.total_earned), 0);
      
      const sttCell = totalSheet.getCell(`B${rowNum}`);
      const nameCell = totalSheet.getCell(`C${rowNum}`);
      const amountCell = totalSheet.getCell(`D${rowNum}`);

      sttCell.value = i + 1; // STT
      sttCell.font = { ...defaultFontTotal, bold: false };

      nameCell.value = branchName; // Tên chi nhánh
      nameCell.font = { ...defaultFontTotal, bold: false };

      amountCell.value = branchTotal; // Số tiền
      amountCell.numFmt = currencyFmt;
      amountCell.font = defaultFontTotal;

      lastBranchRow = rowNum;
    });

    // Grand total in E2 with special color and bold font
    const grandTotalCell = totalSheet.getCell("E2");
    grandTotalCell.value = grandTotal;
    grandTotalCell.numFmt = currencyFmt;
    grandTotalCell.font = { ...defaultFontTotal, bold: true, color: { argb: 'FF0070C0' } }; // Royal Blue

    // Fill bank info into FIXED range B15:D17
    if (profile) {
      const bankRows = [
        { stt: 1, label: "TÊN NGÂN HÀNG", value: profile.bank_name || "" },
        { stt: 2, label: "TÊN TÀI KHOẢN", value: profile.bank_account_name || "" },
        { stt: 3, label: "SỐ TÀI KHOẢN", value: profile.bank_account_number || "" }
      ];

      bankRows.forEach((row, idx) => {
        const rowNum = 15 + idx;
        const sttCell = totalSheet.getCell(`B${rowNum}`);
        const labelCell = totalSheet.getCell(`C${rowNum}`);
        const valueCell = totalSheet.getCell(`D${rowNum}`);

        sttCell.value = row.stt;
        sttCell.font = { ...defaultFontTotal, color: { argb: 'FFFF0000' }, bold: true };
        sttCell.border = borderStyle;

        labelCell.value = row.label;
        labelCell.font = { ...defaultFontTotal, color: { argb: 'FFFF0000' }, bold: true };
        labelCell.border = borderStyle;

        valueCell.value = row.value;
        valueCell.font = defaultFontTotal;
        valueCell.border = borderStyle;
      });
    }
  }

  // Set file metadata and ensure TOTAL sheet is active on open
  workbook.creator = "GumballZ";
  workbook.lastModifiedBy = "GumballZ";
  workbook.views = [
    {
      x: 0, y: 0, width: 10000, height: 20000,
      firstSheet: 0, activeTab: 0, visibility: 'visible'
    }
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = customFilename ? `${customFilename}.xlsx` : `Bao-cao-luong-${monthKey}.xlsx`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  });
}
