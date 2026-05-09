import { createClient } from "@/lib/supabase/server";
import type { AttendanceLogRow, ClassRow } from "@/lib/types";
import { redirect } from "next/navigation";
import { CalendarCheck2 } from "lucide-react";
import ClassForm from "./class-form";
import ClassList from "./class-list";
import DashboardNavigationMenu from "./navigation-menu";
import MonthLogsTable from "./month-logs-table";
import TodayCheckinCard from "./today-checkin-card";
import NotificationButton from "./notification-button";

export default async function DashboardPage() {
  const now = new Date();
  const monthKey = `${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
  const todayIso = now.toISOString().slice(0, 10);
  const day = now.getDay();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, bank_name, bank_account_name, bank_account_number")
    .eq("id", user.id)
    .single();

  const { data: classesRaw } = await supabase
    .from("classes")
    .select("id, class_name, student_name, hourly_rate, schedule, schedule_details, program_details, teacher_name, branch_name, student_count")
    .eq("user_id", user.id)
    .order("class_name");
  const classes = (classesRaw ?? []) as ClassRow[];

  const { data: monthLogsRaw, error: monthError } = await supabase
    .from("attendance_logs")
    .select("id, class_id, date, duration, total_earned, month_key, status, classes (class_name, student_name, branch_name, student_count)")
    .eq("user_id", user.id)
    .eq("month_key", monthKey)
    .order("date", { ascending: false });
  const monthLogs = (monthLogsRaw ?? []) as unknown as AttendanceLogRow[];
  const totalIncome = monthLogs.reduce((sum, row) => sum + Number(row.total_earned), 0);

  // Logic nhắc nhở 7 ngày gần nhất
  const pendingSessions: { class: ClassRow; dateIso: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dIso = d.toISOString().slice(0, 10);
    const dDay = d.getDay();

    const { data: checkins } = await supabase
      .from("daily_checkins")
      .select("class_id")
      .eq("user_id", user.id)
      .eq("date", dIso);
    
    const checkedInIds = new Set((checkins ?? []).map(c => c.class_id));
    
    const missing = classes.filter(c => c.schedule.includes(dDay) && !checkedInIds.has(c.id));
    missing.forEach(c => pendingSessions.push({ class: c, dateIso: dIso }));
  }

  const userName = profile?.full_name || user.user_metadata?.full_name || "Giáo viên";

  return (
    <div
      id="dashboard-top"
      className="flex w-full flex-col gap-8 pb-10 pl-4 pr-3 pt-16 lg:py-10 lg:pl-70 lg:pr-4"
    >
      <DashboardNavigationMenu monthKey={monthKey} profile={profile || { full_name: user.user_metadata?.full_name || "Giáo viên", id: user.id, role: "teacher" }} />
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="clay-card p-5 flex-1 min-w-[300px]">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <CalendarCheck2 className="h-6 w-6 text-emerald-700" />
            {userName}
          </h1>
          <p className="text-sm text-slate-600">
            Báo cáo lương - tháng {monthKey}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationButton pendingSessions={pendingSessions} />
        </div>
      </header>

      {monthError && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
          Lỗi tải dữ liệu: {monthError.message}. Kiểm tra migration mới đã chạy.
        </p>
      )}

      <section id="today-reminders">
        <TodayCheckinCard pendingSessions={pendingSessions} />
      </section>

      <section id="class-management" className="space-y-4">
        <h2 className="text-lg font-medium text-cyan-900">Quản lý lớp học</h2>
        <div id="class-form">
          <ClassForm />
        </div>
        
        <h3 className="text-sm font-medium text-zinc-700 mt-6 mb-2">Danh sách các lớp hiện có</h3>
        <div id="class-list">
          <ClassList classes={classes} />
        </div>
      </section>

      <section id="month-report" className="space-y-3">
        <div className="clay-card flex flex-wrap items-center justify-between gap-3 p-4">
          <h2 className="text-sm font-medium text-zinc-700">Tổng thu nhập tháng hiện tại</h2>
          <span className="text-xl font-semibold text-emerald-900">
            {totalIncome.toLocaleString("vi-VN")} VND
          </span>
        </div>

        <MonthLogsTable monthLogs={monthLogs} />
      </section>
    </div>
  );
}
