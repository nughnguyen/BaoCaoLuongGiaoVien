"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { markClassAbsent, markClassCompleted } from "./actions";
import { Clock, CheckCircle2, XCircle, CalendarDays } from "lucide-react";
import { useState } from "react";
import type { ScheduleDetail } from "@/lib/types";
import { sonner13, sonner14, sonner16 } from "@/lib/sonner-presets";

type PendingSession = {
  class: {
    id: string;
    student_name: string;
    class_name: string;
    hourly_rate: number;
    schedule_details?: ScheduleDetail[];
  };
  dateIso: string;
};

export default function TodaySessions({ pendingSessions }: { pendingSessions: PendingSession[] }) {
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [completedKeys, setCompletedKeys] = useState<Set<string>>(new Set());

  const getDayName = (dateIso: string) => {
    const today = new Date().toISOString().slice(0, 10);
    if (dateIso === today) return "Hôm nay";

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateIso === yesterday.toISOString().slice(0, 10)) return "Hôm qua";

    return new Date(dateIso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  const getTimeRange = (session: PendingSession) => {
    const details = session.class.schedule_details;
    if (!details || details.length === 0) return null;
    const dayOfWeek = new Date(session.dateIso).getDay();
    const match = details.find((d) => d.day === dayOfWeek);
    if (match) return `${match.start_time}–${match.end_time}`;
    return `${details[0].start_time}–${details[0].end_time}`;
  };

  async function handleComplete(classId: string, duration: string, dateIso: string) {
    const key = `${classId}-${dateIso}`;
    setPendingKey(key);
    const fd = new FormData();
    fd.set("class_id", classId);
    fd.set("duration", duration);
    fd.set("date", dateIso);
    const res = await markClassCompleted(fd);
    setPendingKey(null);
    if (res.error) {
      sonner16("Điểm danh thất bại", res.error);
      return;
    }
    sonner13("Đã xác nhận hoàn thành ca dạy");
    setCompletedKeys((prev) => new Set([...prev, key]));
  }

  async function handleAbsent(classId: string, dateIso: string) {
    const key = `${classId}-${dateIso}`;
    setPendingKey(key);
    const fd = new FormData();
    fd.set("class_id", classId);
    fd.set("date", dateIso);
    const res = await markClassAbsent(fd);
    setPendingKey(null);
    if (res.error) {
      sonner16("Cập nhật thất bại", res.error);
      return;
    }
    sonner14("Đã ghi nhận học viên vắng/nghỉ");
    setCompletedKeys((prev) => new Set([...prev, key]));
  }

  const visibleSessions = pendingSessions.filter(
    (s) => !completedKeys.has(`${s.class.id}-${s.dateIso}`)
  );

  if (visibleSessions.length === 0) {
    return (
      <div className="bg-card-bg rounded-2xl border border-border shadow-card p-8 text-center">
        <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground">Tất cả ca dạy đã được xác nhận!</p>
        <p className="text-xs text-muted mt-1">Không có ca nào cần điểm danh</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visibleSessions.map((session) => {
        const key = `${session.class.id}-${session.dateIso}`;
        const isPending = pendingKey === key;
        const timeRange = getTimeRange(session);
        const dayName = getDayName(session.dateIso);
        const isToday = session.dateIso === new Date().toISOString().slice(0, 10);

        return (
          <div
            key={key}
            className="bg-card-bg rounded-2xl border border-border shadow-card p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-card-hover transition-all duration-200"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Time indicator */}
              <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                isToday ? "bg-primary-light" : "bg-gray-50"
              }`}>
                <Clock className={`w-4 h-4 mb-0.5 ${isToday ? "text-primary" : "text-muted"}`} />
                <span className={`text-[11px] font-bold ${isToday ? "text-primary" : "text-muted"}`}>
                  {timeRange?.split("–")[0] || "—"}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-foreground truncate">
                    {session.class.class_name}
                  </h4>
                  <Badge variant={isToday ? "default" : "outline"} className="shrink-0 text-[10px]">
                    {dayName}
                  </Badge>
                </div>
                <p className="text-xs text-muted truncate">
                  {session.class.student_name}
                  {timeRange && <span className="ml-2">• {timeRange}</span>}
                </p>
                <p className="text-xs font-bold text-success mt-1">
                  {Number(session.class.hourly_rate).toLocaleString("vi-VN")}đ/giờ
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
              <Button
                size="sm"
                variant="success"
                onClick={() => handleComplete(session.class.id, "2", session.dateIso)}
                disabled={isPending}
                className="flex-1 sm:flex-none gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Xác nhận
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAbsent(session.class.id, session.dateIso)}
                disabled={isPending}
                className="flex-1 sm:flex-none gap-1.5 text-danger border-danger/20 hover:bg-danger-light hover:border-danger/30"
              >
                <XCircle className="w-3.5 h-3.5" />
                Vắng
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
