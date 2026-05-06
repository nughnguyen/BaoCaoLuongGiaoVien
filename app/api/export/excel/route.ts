import { createClient } from "@/lib/supabase/server";
import ExcelJS from "exceljs";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const monthKey = searchParams.get("month_key");

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

  const { data: rows, error } = await supabase
    .from("attendance_logs")
    .select("date, duration, total_earned, status, classes (class_name, student_name, teacher_name)")
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
    classes: { class_name: string; student_name: string; teacher_name: string } | null;
  };

  const sessions = (rows ?? []) as unknown as ExportRow[];

  // Group sessions by class
  const sessionsByClass = new Map<string, ExportRow[]>();
  for (const s of sessions) {
    const key = `${s.classes?.class_name ?? "Khác"} - ${s.classes?.student_name ?? ""}`;
    if (!sessionsByClass.has(key)) {
      sessionsByClass.set(key, []);
    }
    sessionsByClass.get(key)!.push(s);
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Bao-cao-luong";
  const sheet = workbook.addWorksheet("Ca day", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "Ngày", key: "session_date", width: 12 },
    { header: "Lớp", key: "class_name", width: 20 },
    { header: "Học viên", key: "student_name", width: 20 },
    { header: "Giờ", key: "hours", width: 8 },
    { header: "Thành tiền", key: "amount", width: 16 },
    { header: "Trạng thái", key: "status", width: 14 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle" };

  let grandTotal = 0;

  for (const [classKey, classSessions] of sessionsByClass.entries()) {
    // Lấy thông tin giáo viên từ buổi đầu tiên của lớp
    const teacherName = classSessions[0]?.classes?.teacher_name ?? "Giáo viên";
    
    // Header dòng lớp
    const classHeader = sheet.addRow({
      session_date: `Lớp: ${classKey}`,
      class_name: `GV: ${teacherName}`,
      student_name: "",
      hours: "",
      amount: "",
      status: "",
    });
    classHeader.font = { bold: true, color: { argb: "FF0070C0" } };
    sheet.mergeCells(`A${classHeader.number}:C${classHeader.number}`);

    let classTotal = 0;
    for (const s of classSessions) {
      const lineAmount = Number(s.total_earned);
      classTotal += lineAmount;

      sheet.addRow({
        session_date: s.date,
        class_name: s.classes?.class_name ?? "",
        student_name: s.classes?.student_name ?? "",
        hours: Number(s.duration),
        amount: lineAmount,
        status: s.status,
      });
    }

    grandTotal += classTotal;

    const classSumRow = sheet.addRow({
      session_date: "Tổng lớp",
      class_name: "",
      hours: "",
      student_name: "",
      amount: classTotal,
      status: "",
    });
    classSumRow.font = { italic: true, bold: true };
    sheet.addRow({}); // Dòng trống ngăn cách
  }

  const grandSumRow = sheet.addRow({
    session_date: "TỔNG CỘNG TẤT CẢ",
    class_name: "",
    hours: "",
    student_name: "",
    amount: grandTotal,
    status: "",
  });
  grandSumRow.font = { bold: true, size: 12, color: { argb: "FFFF0000" } };

  const buffer = await workbook.xlsx.writeBuffer();

  const filename = `bao-cao-thang_${monthKey}.xlsx`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
