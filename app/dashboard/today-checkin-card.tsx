"use client";

import { markClassAbsent, markClassCompleted } from "./actions";
import { useState } from "react";

type TodayClass = {
  id: string;
  student_name: string;
  class_name: string;
  hourly_rate: number;
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

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Nhắc lịch dạy hôm nay</h2>
      {classes.map((item) => (
        <div key={item.id} className="clay-card space-y-3 p-5">
          <p className="text-sm">
            Hôm nay bạn có ca dạy <b>{item.student_name}</b> ({item.class_name}). Bạn đã hoàn thành chưa?
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pendingId === item.id}
              onClick={() => submitPresent(item.id, "1")}
              className="rounded-2xl bg-emerald-300 px-4 py-2 text-sm text-emerald-950 shadow-[6px_6px_14px_#bdd7c8,-4px_-4px_12px_#f3fff9]"
            >
              Hoàn thành ca dạy
            </button>
            <button
              type="button"
              disabled={pendingId === item.id}
              onClick={() => submitAbsent(item.id)}
              className="rounded-2xl bg-orange-200 px-4 py-2 text-sm text-orange-950 shadow-[6px_6px_14px_#e0c3b5,-4px_-4px_12px_#fff4ef]"
            >
              Học viên vắng / Nghỉ học
            </button>
          </div>
          <p className="text-xs text-slate-600">
            Đơn giá: {Number(item.hourly_rate).toLocaleString("vi-VN")} VND/giờ (mặc định ghi nhận 1 giờ).
          </p>
        </div>
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  );
}
