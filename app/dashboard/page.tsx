import { createClient } from "@/lib/supabase/server";
import type { AttendanceLogRow, ClassRow } from "@/lib/types";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarCheck2 } from "lucide-react";
import ClassForm from "./class-form";
import TodayCheckinCard from "./today-checkin-card";
import { signOut } from "./actions";

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
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: classesRaw } = await supabase
    .from("classes")
    .select("id, class_name, student_name, hourly_rate, schedule, program_details")
    .eq("user_id", user.id)
    .order("class_name");
  const classes = (classesRaw ?? []) as ClassRow[];

  const { data: todayCheckins } = await supabase
    .from("daily_checkins")
    .select("class_id")
    .eq("user_id", user.id)
    .eq("date", todayIso);
  const doneClassIds = new Set((todayCheckins ?? []).map((i) => i.class_id));
  const todayClasses = classes.filter(
    (item) => item.schedule.includes(day) && !doneClassIds.has(item.id),
  );

  const { data: monthLogsRaw, error: monthError } = await supabase
    .from("attendance_logs")
    .select("id, date, duration, total_earned, month_key, status, classes (class_name, student_name)")
    .eq("user_id", user.id)
    .eq("month_key", monthKey)
    .order("date", { ascending: false });
  const monthLogs = (monthLogsRaw ?? []) as unknown as AttendanceLogRow[];
  const totalIncome = monthLogs.reduce((sum, row) => sum + Number(row.total_earned), 0);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="clay-card p-5">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <CalendarCheck2 className="h-6 w-6 text-emerald-700" />
            Smart Teaching Log
          </h1>
          <p className="text-sm text-slate-600">
            Xin chào{profile?.full_name ? `, ${profile.full_name}` : ""} - tháng {monthKey}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/api/export/excel?month_key=${monthKey}`} className="clay-btn px-4 py-2 text-sm">
            Xuất báo cáo tháng
          </Link>
          <form action={signOut}>
            <button type="submit" className="clay-inset px-4 py-2 text-sm text-slate-700">
              Đăng xuất
            </button>
          </form>
        </div>
      </header>

      {monthError && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
          Lỗi tải dữ liệu: {monthError.message}. Kiểm tra migration mới đã chạy.
        </p>
      )}

      <TodayCheckinCard classes={todayClasses} />

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-700">Quản lý lớp học</h2>
        <ClassForm />
      </section>

      <section className="space-y-3">
        <div className="clay-card flex flex-wrap items-center justify-between gap-3 p-4">
          <h2 className="text-sm font-medium text-zinc-700">Tổng thu nhập tháng hiện tại</h2>
          <span className="text-xl font-semibold text-emerald-900">
            {totalIncome.toLocaleString("vi-VN")} VND
          </span>
        </div>

        <div className="clay-surface overflow-x-auto p-3">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className="px-3 py-2 font-medium text-zinc-700">Ngày</th>
                <th className="px-3 py-2 font-medium text-zinc-700">Lớp / học viên</th>
                <th className="px-3 py-2 font-medium text-zinc-700">Giờ</th>
                <th className="px-3 py-2 font-medium text-zinc-700">Thành tiền</th>
                <th className="px-3 py-2 font-medium text-zinc-700">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {monthLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-zinc-500">
                    Chưa có log dạy trong tháng hiện tại.
                  </td>
                </tr>
              ) : (
                monthLogs.map((row) => (
                  <tr key={row.id} className="border-b border-zinc-100">
                    <td className="px-3 py-2">{row.date}</td>
                    <td className="px-3 py-2">
                      {row.classes?.class_name} - {row.classes?.student_name}
                    </td>
                    <td className="px-3 py-2">{row.duration}</td>
                    <td className="px-3 py-2 font-medium">
                      {Number(row.total_earned).toLocaleString("vi-VN")} VND
                    </td>
                    <td className="px-3 py-2">{row.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
