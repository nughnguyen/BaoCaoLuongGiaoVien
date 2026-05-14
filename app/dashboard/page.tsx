import { createClient } from "@/lib/supabase/server";
import type { AttendanceLogRow, ClassRow, Profile } from "@/lib/types";
import { redirect } from "next/navigation";
import { CalendarCheck2, PlusIcon, Sparkles } from "lucide-react";
import ClassForm from "./class-form";
import ClassList from "./class-list";
import Sidebar, { MobileSidebar } from "./sidebar";
import StatsCards from "./stats-cards";
import EarningsChart from "./earnings-chart";
import TodaySessions from "./today-sessions";
import SessionTable from "./session-table";
import RightPanel from "./right-panel";
import NotificationButton from "./notification-button";
import Clock from "./clock";
import Footer from "./footer";

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
  const profile = (profileRaw as unknown as Profile | null) || {
    full_name: user.user_metadata?.full_name || "Giáo viên",
    id: user.id,
    role: "teacher",
  };

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

  const userName = profile?.full_name || "Giáo viên";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div id="dashboard-top" className="absolute top-0 left-0 w-full h-1" />
      
      {/* Sidebar (Desktop) */}
      <Sidebar monthKey={monthKey} profile={profile} />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-border/50 px-4 lg:px-8 py-4 lg:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MobileSidebar monthKey={monthKey} profile={profile} />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl lg:text-2xl font-black text-foreground tracking-tight">Dashboard</h1>
                  <Sparkles className="w-4 h-4 text-warning animate-pulse hidden sm:block" />
                </div>
                <p className="text-[10px] lg:text-sm font-medium text-muted-light flex items-center gap-2">
                  Monthly Overview — <Clock />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
              <NotificationButton pendingSessions={pendingSessions} />
              <div className="flex items-center gap-3 p-1 pr-1 lg:pr-4 rounded-full bg-gray-50 border border-border/50 hover:bg-white transition-colors cursor-pointer group">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-primary via-accent-blue to-accent-purple flex items-center justify-center text-white text-[10px] lg:text-xs font-black shadow-lg group-hover:scale-105 transition-transform">
                  {userName
                    .split(" ")
                    .map((w: string) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-bold text-foreground leading-none mb-0.5">{userName}</p>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider leading-none">Teacher</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 lg:p-8">
          {/* Main Column */}
          <div className="flex-1 min-w-0 space-y-6 lg:space-y-10">
            {/* Stats Cards */}
            <StatsCards
              totalSalary={totalIncome}
              totalHours={totalHours}
              completedSessions={completedSessions}
            />

            {/* Chart */}
            <div className="bg-card-bg rounded-3xl border border-border shadow-xl shadow-primary/5 p-2 overflow-hidden">
              <EarningsChart monthLogs={monthLogs} />
            </div>

            {/* Today Sessions */}
            <section id="today-reminders" className="scroll-mt-[80px] lg:scroll-mt-[100px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-base lg:text-lg font-black text-foreground flex items-center gap-3 uppercase tracking-wider">
                  <div className="p-2 rounded-xl bg-primary-light text-primary">
                    <CalendarCheck2 className="w-5 h-5" />
                  </div>
                  Ca dạy cần điểm danh
                </h2>
                <span className="w-fit px-3 py-1 rounded-full bg-danger-light text-danger text-[10px] font-black uppercase tracking-widest">
                  {pendingSessions.length} ca chưa xác nhận
                </span>
              </div>
              <TodaySessions pendingSessions={pendingSessions} />
            </section>

            {/* Class Form */}
            <section id="class-form" className="scroll-mt-[80px] lg:scroll-mt-[100px]">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-success-light text-success">
                  <PlusIcon className="w-5 h-5" />
                </div>
                <h2 className="text-base lg:text-lg font-black text-foreground uppercase tracking-wider">Tạo lớp học mới</h2>
              </div>
              <ClassForm />
            </section>

            {/* Class List */}
            <section id="class-list" className="scroll-mt-[80px] lg:scroll-mt-[100px]">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-accent-blue/10 text-accent-blue">
                  <PlusIcon className="w-5 h-5" />
                </div>
                <h2 className="text-base lg:text-lg font-black text-foreground uppercase tracking-wider">Danh sách lớp học</h2>
              </div>
              <ClassList classes={classes} />
            </section>

            {/* Session Table */}
            <section id="month-report" className="scroll-mt-[80px] lg:scroll-mt-[100px]">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-accent-purple/10 text-accent-purple">
                  <PlusIcon className="w-5 h-5" />
                </div>
                <h2 className="text-base lg:text-lg font-black text-foreground uppercase tracking-wider">Báo cáo tháng</h2>
              </div>
              <SessionTable monthLogs={monthLogs} />
            </section>
          </div>

          {/* Right Panel */}
          <div className="w-full lg:w-[320px] shrink-0">
            <div className="lg:sticky lg:top-[110px] space-y-6">
              <RightPanel
                monthLogs={monthLogs}
                pendingSessions={pendingSessions}
                classes={classes}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>

      {/* Floating Action Button */}
      <a
        href="#today-reminders"
        className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-primary via-accent-blue to-accent-purple text-white shadow-2xl shadow-primary/40 flex items-center justify-center hover:shadow-primary/60 hover:scale-110 active:scale-95 transition-all duration-300 z-50 group"
      >
        <PlusIcon className="w-6 h-6 lg:w-8 lg:h-8 group-hover:rotate-90 transition-transform duration-300" />
      </a>
    </div>
  );
}
