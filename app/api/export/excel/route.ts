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

      row.getCell(1).value = date.getDate();
      row.getCell(2).value = date.getMonth() + 1;
      row.getCell(3).value = date.getFullYear();
      row.getCell(4).value = timeSlot; 
      row.getCell(5).value = s.classes?.teacher_name ?? "";
      row.getCell(6).value = s.classes?.student_count ?? 1;
      row.getCell(7).value = s.classes?.student_name ?? "";
      row.getCell(8).value = s.classes?.class_name ?? ""; 
      row.getCell(9).value = Number(s.duration);
      row.getCell(10).value = s.classes ? (Number(s.total_earned) / Number(s.duration)) : 0;
      row.getCell(11).value = Number(s.total_earned);
      
      branchTotalAmount += Number(s.total_earned);
      grandTotal += Number(s.total_earned);
      row.commit();
      rowIdx++;
    }

    // Apply borders ONLY to M2 and N3 (Summary area)
    const borderStyle: Partial<ExcelJS.Borders> = {
      top: { style: 'thin' as ExcelJS.BorderStyle },
      left: { style: 'thin' as ExcelJS.BorderStyle },
      bottom: { style: 'thin' as ExcelJS.BorderStyle },
      right: { style: 'thin' as ExcelJS.BorderStyle }
    };

    // Clear any existing borders in column M and N for rows >= 4
    sheet.getColumn("M").eachCell?.((cell, rowNum) => {
      if (rowNum >= 4) cell.border = {};
    });
    sheet.getColumn("N").eachCell?.((cell, rowNum) => {
      if (rowNum >= 4) cell.border = {};
    });

    const m2 = sheet.getCell("M2");
    const n3 = sheet.getCell("N3");
    
    m2.border = borderStyle;
    n3.border = borderStyle;

    // Set M3 value as the calculated branch total and format as currency
    const m3 = sheet.getCell("M3");
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
    // Fill branch summary in TOTAL sheet
    const branches = Array.from(branchMap.keys());
    const currencyFmt = '#,##0"đ"';
    let lastBranchRow = 1; // Assuming row 1 is header

    branches.forEach((branchName, i) => {
      const rowNum = 2 + i;
      const branchSessions = branchMap.get(branchName) || [];
      const branchTotal = branchSessions.reduce((sum, s) => sum + Number(s.total_earned), 0);
      
      const sttCell = totalSheet.getCell(`B${rowNum}`);
      const nameCell = totalSheet.getCell(`C${rowNum}`);
      const amountCell = totalSheet.getCell(`D${rowNum}`);

      sttCell.value = i + 1; // STT
      sttCell.font = { bold: false };

      nameCell.value = branchName; // Tên chi nhánh
      nameCell.font = { bold: false };

      amountCell.value = branchTotal; // Số tiền
      amountCell.numFmt = currencyFmt;

      lastBranchRow = rowNum;
    });

    // Grand total in E2
    totalSheet.getCell("E2").value = grandTotal;
    totalSheet.getCell("E2").numFmt = currencyFmt;

    // Fill bank info, spaced 1 row after the last branch
    if (profile) {
      const bankStartRow = lastBranchRow + 2;
      const bankNameCell = totalSheet.getCell(`D${bankStartRow}`);
      const bankAccNameCell = totalSheet.getCell(`D${bankStartRow + 1}`);
      const bankAccNumCell = totalSheet.getCell(`D${bankStartRow + 2}`);

      bankNameCell.value = profile.bank_name || "";
      bankAccNameCell.value = profile.bank_account_name || "";
      bankAccNumCell.value = profile.bank_account_number || "";
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
