"use client";

import { AlertTriangle, Clock, BookOpen, CalendarCheck2, CheckCircle2 } from "lucide-react";
import type { AttendanceLogRow, ClassRow } from "@/lib/types";

type RightPanelProps = {
  monthLogs: AttendanceLogRow[];
  pendingSessions: { class: ClassRow; dateIso: string }[];
  classes: ClassRow[];
};

export default function RightPanel({ monthLogs, pendingSessions, classes }: RightPanelProps) {
  const recentLogs = monthLogs.slice(0, 5);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayPending = pendingSessions.filter((s) => s.dateIso === todayStr);

  return (
    <div className="space-y-5">
      {/* Alerts */}
      {todayPending.length > 0 && (
        <div className="bg-warning-light border border-warning/20 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Chưa điểm danh</p>
              <p className="text-xs text-amber-700 mt-1">
                Bạn có {todayPending.length} ca dạy hôm nay chưa xác nhận
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div className="bg-card-bg rounded-2xl border border-border shadow-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Ca dạy gần đây
        </h3>
        {recentLogs.length === 0 ? (
          <p className="text-xs text-muted text-center py-4">Chưa có ca dạy nào</p>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    log.status === "completed" ? "bg-success-light" : "bg-danger-light"
                  }`}
                >
                  {log.status === "completed" ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-danger" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {log.classes?.class_name || "—"}
                  </p>
                  <p className="text-[11px] text-muted">
                    {new Date(log.date).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                    })}{" "}
                    • {log.duration}h • {Number(log.total_earned).toLocaleString("vi-VN")}đ
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="bg-card-bg rounded-2xl border border-border shadow-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          Tổng quan nhanh
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-muted">Tổng lớp học</span>
            <span className="text-sm font-semibold text-foreground">{classes.length}</span>
          </div>
          <div className="border-t border-border/50"></div>
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-muted">Ca dạy tháng này</span>
            <span className="text-sm font-semibold text-foreground">{monthLogs.length}</span>
          </div>
          <div className="border-t border-border/50"></div>
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-muted">Ca hoàn thành</span>
            <span className="text-sm font-semibold text-success">
              {monthLogs.filter((l) => l.status === "completed").length}
            </span>
          </div>
          <div className="border-t border-border/50"></div>
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-muted">Ca vắng</span>
            <span className="text-sm font-semibold text-danger">
              {monthLogs.filter((l) => l.status === "absent").length}
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Schedule */}
      <div className="bg-card-bg rounded-2xl border border-border shadow-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <CalendarCheck2 className="w-4 h-4 text-primary" />
          Lịch tuần này
        </h3>
        <div className="space-y-2">
          {(() => {
            const today = new Date();
            const dayOfWeek = today.getDay();
            const dayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
            const weekDays = [];
            for (let i = 0; i < 7; i++) {
              const d = new Date(today);
              d.setDate(today.getDate() - dayOfWeek + i);
              weekDays.push({
                day: i,
                label: dayLabels[i],
                date: d,
                isToday: d.toISOString().slice(0, 10) === todayStr,
              });
            }

            return weekDays.map((wd) => {
              const classesToday = classes.filter((c) => c.schedule.includes(wd.day));
              return (
                <div
                  key={wd.day}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    wd.isToday ? "bg-primary-light/50" : ""
                  }`}
                >
                  <span
                    className={`text-xs font-bold w-8 ${
                      wd.isToday ? "text-primary" : "text-muted"
                    }`}
                  >
                    {wd.label}
                  </span>
                  <div className="flex-1 flex flex-wrap gap-1">
                    {classesToday.length === 0 ? (
                      <span className="text-[11px] text-muted-light">—</span>
                    ) : (
                      classesToday.map((c) => (
                        <span
                          key={c.id}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600"
                        >
                          {c.class_name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}
