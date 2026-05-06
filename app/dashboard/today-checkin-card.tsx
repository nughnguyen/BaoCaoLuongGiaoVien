"use client";

import { markClassAbsent, markClassCompleted } from "./actions";
import { useState } from "react";
import type { ScheduleDetail } from "@/lib/types";

type TodayClass = {
  id: string;
  student_name: string;
  class_name: string;
  hourly_rate: number;
  schedule_details?: ScheduleDetail[];
};

export default function TodayCheckinCard({ classes }: { classes: TodayClass[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (classes.length === 0) return null;

  async function submitPresent(classId: string, duration: string) {
    setError(null);
    setPendingId(classId);
    const fd = new FormData();
    fd.set("class_id", classId);
    fd.set("duration", duration);
    const res = await markClassCompleted(fd);
    setPendingId(null);
    if (res.error) setError(res.error);
  }

  async function submitAbsent(classId: string) {
    setError(null);
    setPendingId(classId);
    const fd = new FormData();
    fd.set("class_id", classId);
    const res = await markClassAbsent(fd);
    setPendingId(null);
    if (res.error) setError(res.error);
  }

  const todayNum = new Date().getDay();

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-cyan-900">Nhắc lịch dạy hôm nay</h2>
      {classes.map((item) => {
        const todaySchedule = item.schedule_details?.find((s) => s.day === todayNum);
        const duration = todaySchedule ? todaySchedule.duration : 1;
        const totalEarned = Number(item.hourly_rate) * duration;

        return (
          <div key={item.id} className="clay-card space-y-3 p-5 relative">
            <p className="text-sm">
              Hôm nay bạn có ca dạy <b>{item.student_name}</b> ({item.class_name})
              {todaySchedule && ` từ ${todaySchedule.start_time} đến ${todaySchedule.end_time}`}. 
              Bạn đã hoàn thành chưa?
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pendingId === item.id}
                onClick={() => submitPresent(item.id, String(duration))}
                className="rounded-2xl bg-cyan-200 px-4 py-2 text-sm text-cyan-950 shadow-[6px_6px_14px_#a5e2eb,-4px_-4px_12px_#ffffff] font-medium"
              >
                ✔ Hoàn thành ca dạy ({duration}h)
              </button>
              <button
                type="button"
                disabled={pendingId === item.id}
                onClick={() => submitAbsent(item.id)}
                className="rounded-2xl bg-orange-100 px-4 py-2 text-sm text-orange-950 shadow-[6px_6px_14px_#d9c8bd,-4px_-4px_12px_#ffffff] font-medium"
              >
                Học viên vắng / Nghỉ
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Tiền lương dự kiến: {totalEarned.toLocaleString("vi-VN")} VND (Đơn giá: {Number(item.hourly_rate).toLocaleString("vi-VN")} VND/giờ).
            </p>
          </div>
        );
      })}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  );
}
