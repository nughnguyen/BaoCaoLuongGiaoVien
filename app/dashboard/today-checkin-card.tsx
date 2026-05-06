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
  const [durationPopupId, setDurationPopupId] = useState<string | null>(null);
  const [durationInput, setDurationInput] = useState("1");

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
      <h2 className="text-lg font-semibold text-cyan-900">Nhắc lịch dạy hôm nay</h2>
      {classes.map((item) => (
        <div key={item.id} className="clay-card space-y-3 p-5 relative">
          <p className="text-sm">
            Hôm nay bạn có ca dạy <b>{item.student_name}</b> ({item.class_name}). Bạn đã hoàn thành chưa?
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pendingId === item.id}
              onClick={() => {
                setDurationInput("1");
                setDurationPopupId(item.id);
              }}
              className="rounded-2xl bg-cyan-200 px-4 py-2 text-sm text-cyan-950 shadow-[6px_6px_14px_#a5e2eb,-4px_-4px_12px_#ffffff] font-medium"
            >
              Hoàn thành ca dạy
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
            Đơn giá: {Number(item.hourly_rate).toLocaleString("vi-VN")} VND/giờ.
          </p>

          {/* Popup Duration */}
          {durationPopupId === item.id && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-sm rounded-2xl bg-[#e0f7fa] p-5 shadow-[8px_8px_16px_#b3c6c8,-8px_-8px_16px_#ffffff] space-y-3">
                <p className="text-sm font-semibold text-cyan-950">Nhập số giờ giảng dạy:</p>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  value={durationInput}
                  onChange={(e) => setDurationInput(e.target.value)}
                  className="w-full rounded-xl bg-[#e0f7fa] px-3 py-2 outline-none shadow-[inset_4px_4px_8px_#b3c6c8,inset_-4px_-4px_8px_#ffffff]"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setDurationPopupId(null)}
                    className="rounded-xl px-3 py-1.5 text-sm font-medium text-slate-600 shadow-[4px_4px_8px_#b3c6c8,-4px_-4px_8px_#ffffff]"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                      setDurationPopupId(null);
                      submitPresent(item.id, durationInput);
                    }}
                    className="rounded-xl bg-cyan-500 px-3 py-1.5 text-sm font-medium text-white shadow-[4px_4px_8px_#b3c6c8,-4px_-4px_8px_#ffffff]"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  );
}
