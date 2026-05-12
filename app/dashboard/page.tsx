import { createClient } from "@/lib/supabase/server";
import type { AttendanceLogRow, ClassRow, Profile } from "@/lib/types";
import { redirect } from "next/navigation";
import { CalendarCheck2, PlusIcon } from "lucide-react";
import ClassForm from "./class-form";
import ClassList from "./class-list";
import Sidebar from "./sidebar";
import StatsCards from "./stats-cards";
import EarningsChart from "./earnings-chart";
import TodaySessions from "./today-sessions";
import SessionTable from "./session-table";
import RightPanel from "./right-panel";
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

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("id, full_name, role, bank_name, bank_account_name, bank_account_number")
    .eq("id", user.id)
    .single();
  const profile = profileRaw as unknown as Profile | null;

  const { data: classesRaw } = await supabase
    .from("classes")
    .select("id, class_name, student_name, hourly_rate, schedule, schedule_details, program_details, teacher_name, branch_name, student_count")
    .eq("user_id", user.id)
    .order("class_name");
  const classes = (classesRaw ?? []) as ClassRow[];

  const { data: monthLogsRaw } = await supabase
    .from("attendance_logs")
    .select("id, class_id, date, duration, total_earned, month_key, status, classes (class_name, student_name, branch_name, student_count)")
    .eq("user_id", user.id)
    .eq("month_key", monthKey)
    .order("date", { ascending: false });
  const monthLogs = (monthLogsRaw ?? []) as unknown as AttendanceLogRow[];

  const totalIncome = monthLogs.reduce((sum, row) => sum + Number(row.total_earned), 0);
  const totalHours = monthLogs.reduce((sum, row) => sum + Number(row.duration), 0);
  const completedSessions = monthLogs.filter((l) => l.status === "completed").length;

  // Pending sessions logic (last 7 days)
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

    const checkedInIds = new Set((checkins ?? []).map((c) => c.class_id));
    const missing = classes.filter((c) => c.schedule.includes(dDay) && !checkedInIds.has(c.id));
    missing.forEach((c) => pendingSessions.push({ class: c, dateIso: dIso }));
  }

  const userName = profile?.full_name || user.user_metadata?.full_name || "Giáo viên";

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        monthKey={monthKey}
        profile={
          profile || {
            full_name: user.user_metadata?.full_name || "Giáo viên",
            id: user.id,
            role: "teacher",
          }
        }
      />

      {/* Main Content */}
      <div className="ml-[240px]">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted">Monthly Teaching Overview — {monthKey}</p>
            </div>
            <div className="flex items-center gap-3">
              <NotificationButton pendingSessions={pendingSessions} />
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {userName
                  .split(" ")
                  .map((w: string) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content — 2 columns (main + right panel) */}
        <div className="flex gap-6 p-6">
          {/* Main Column */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Stats Cards */}
            <StatsCards
              totalSalary={totalIncome}
              totalHours={totalHours}
              completedSessions={completedSessions}
            />

            {/* Chart */}
            <EarningsChart monthLogs={monthLogs} />

            {/* Today Sessions */}
            <section id="today-reminders">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <CalendarCheck2 className="w-5 h-5 text-primary" />
                  Ca dạy cần điểm danh
                </h2>
                <span className="text-xs text-muted">
                  {pendingSessions.length} ca chưa xác nhận
                </span>
              </div>
              <TodaySessions pendingSessions={pendingSessions} />
            </section>

            {/* Class Form */}
            <section id="class-form">
              <h2 className="text-base font-semibold text-foreground mb-4">Tạo lớp học mới</h2>
              <ClassForm />
            </section>

            {/* Class List */}
            <section id="class-list">
              <h2 className="text-base font-semibold text-foreground mb-4">Danh sách lớp học</h2>
              <ClassList classes={classes} />
            </section>

            {/* Session Table */}
            <section id="month-report">
              <h2 className="text-base font-semibold text-foreground mb-4">Báo cáo tháng</h2>
              <SessionTable monthLogs={monthLogs} />
            </section>
          </div>

          {/* Right Panel */}
          <div className="w-[300px] shrink-0">
            <div className="sticky top-[73px]">
              <RightPanel
                monthLogs={monthLogs}
                pendingSessions={pendingSessions}
                classes={classes}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <a
        href="#today-reminders"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-500 text-white shadow-lg shadow-primary/30 flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all duration-200 z-50"
      >
        <PlusIcon className="w-6 h-6" />
      </a>
    </div>
  );
}
