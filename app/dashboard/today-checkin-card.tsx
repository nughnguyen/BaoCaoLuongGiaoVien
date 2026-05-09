"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { markClassAbsent, markClassCompleted } from "./actions";
import { BellIcon, CircleIcon, XIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

export default function TodayCheckinCard({ pendingSessions }: { pendingSessions: PendingSession[] }) {
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [readKeys, setReadKeys] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState(pendingSessions.length > 0);

  useEffect(() => {
    if (pendingSessions.length === 0 || !showPopup) return;
    const timer = window.setTimeout(() => setShowPopup(false), 10_000);
    return () => window.clearTimeout(timer);
  }, [pendingSessions.length, showPopup]);

  const unread = useMemo(
    () => pendingSessions.filter((s) => !readKeys.includes(`${s.class.id}-${s.dateIso}`)).length,
    [pendingSessions, readKeys],
  );

  const getDayName = (dateIso: string) => {
    const today = new Date().toISOString().slice(0, 10);
    if (dateIso === today) return "Hôm nay";
    
    const d = new Date(dateIso);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayIso = yesterday.toISOString().slice(0, 10);
    
    if (dateIso === yesterdayIso) return "Hôm qua";
    
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  async function submitPresent(classId: string, duration: string, dateIso: string) {
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
    setReadKeys((prev) => [...prev, key]);
  }

  async function submitAbsent(classId: string, dateIso: string) {
    const key = `${classId}-${dateIso}`;
    setPendingKey(key);
    const fd = new FormData();
    fd.set("class_id", classId);
    fd.set("date", dateIso);
    const res = await markClassAbsent(fd);
    setPendingKey(null);
    if (res.error) {
      sonner16("Cập nhật nghỉ/vắng thất bại", res.error);
      return;
    }
    sonner14("Đã ghi nhận học viên vắng/nghỉ");
    setReadKeys((prev) => [...prev, key]);
  }

  return (
    <section className="space-y-3">
      {showPopup && pendingSessions.length > 0 && (
        <div className="fixed right-4 top-4 z-40 w-[min(420px,calc(100vw-2rem))] rounded-2xl border border-cyan-100 bg-white p-4 shadow-xl">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-cyan-900">Nhắc lịch dạy & điểm danh</p>
              <p className="text-xs text-slate-500">Tự động ẩn sau 10 giây</p>
            </div>
            <button
              type="button"
              aria-label="Đóng nhắc lịch"
              onClick={() => setShowPopup(false)}
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
            >
              <XIcon className="size-4" />
            </button>
          </div>
          <div className="text-sm">
            Bạn có <b>{pendingSessions.length}</b> ca dạy chưa điểm danh trong 7 ngày qua.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
        {pendingSessions.map((s) => {
          const key = `${s.class.id}-${s.dateIso}`;
          const dDay = new Date(s.dateIso).getDay();
          const schedule = s.class.schedule_details?.find((sd) => sd.day === dDay);
          const duration = schedule ? schedule.duration : 1;
          const totalEarned = Number(s.class.hourly_rate) * duration;
          const dayLabel = getDayName(s.dateIso);

          return (
            <div key={key} className="clay-card space-y-3 p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-cyan-600 text-white text-[11px] font-bold rounded-bl-xl shadow-sm">
                {dayLabel}
              </div>
              <div className="pr-12">
                <p className="text-sm">
                  Ca dạy: <b>{s.class.student_name}</b> ({s.class.class_name})
                  {schedule && ` lúc ${schedule.start_time} - ${schedule.end_time}`}.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pendingKey === key}
                  onClick={() => void submitPresent(s.class.id, String(duration), s.dateIso)}
                  className="rounded-2xl bg-cyan-200 px-4 py-2 text-sm text-cyan-950 shadow-[6px_6px_14px_#a5e2eb,-4px_-4px_12px_#ffffff] font-semibold"
                >
                  Xác nhận dạy ({duration}h)
                </button>
                <button
                  type="button"
                  disabled={pendingKey === key}
                  onClick={() => void submitAbsent(s.class.id, s.dateIso)}
                  className="rounded-2xl bg-orange-100 px-4 py-2 text-sm text-orange-950 shadow-[6px_6px_14px_#d9c8bd,-4px_-4px_12px_#ffffff] font-semibold"
                >
                  Báo nghỉ/vắng
                </button>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                Lương dự kiến: {totalEarned.toLocaleString("vi-VN")} VND.
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
