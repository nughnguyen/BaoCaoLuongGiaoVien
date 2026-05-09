"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { BellIcon, CircleIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { markClassAbsent, markClassCompleted } from "./actions";
import { sonner13, sonner14, sonner16 } from "@/lib/sonner-presets";

type PendingSession = {
  class: {
    id: string;
    student_name: string;
    class_name: string;
    hourly_rate: number;
    schedule_details?: any[];
  };
  dateIso: string;
};

export default function NotificationButton({ pendingSessions }: { pendingSessions: PendingSession[] }) {
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [readKeys, setReadKeys] = useState<string[]>([]);

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
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative gap-2 clay-card bg-white/80 border-cyan-100 h-11 px-4">
          <BellIcon className="size-5 text-cyan-700" />
          <span className="hidden sm:inline font-medium text-cyan-900">Thông báo</span>
          {unread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-2 -top-2 h-5 min-w-5 flex items-center justify-center px-1 py-0 text-[11px] font-bold shadow-lg"
            >
              {unread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 border-cyan-100 shadow-2xl rounded-2xl overflow-hidden">
        <div className="grid">
          <div className="flex items-center justify-between gap-2 px-4 py-3 bg-cyan-50/50">
            <span className="font-semibold text-cyan-900">Thông báo lịch dạy</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-full px-3 py-1 text-xs text-cyan-700 hover:bg-cyan-100 hover:text-cyan-800"
              onClick={() => setReadKeys(pendingSessions.map((s) => `${s.class.id}-${s.dateIso}`))}
            >
              Đánh dấu đã đọc
            </Button>
          </div>
          <Separator className="bg-cyan-100" />
          <ul className="grid gap-0 p-0 max-h-[400px] overflow-y-auto">
            {pendingSessions.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-slate-500 bg-white">
                Không có ca dạy nào cần điểm danh.
              </li>
            )}
            {pendingSessions.map((s) => {
              const key = `${s.class.id}-${s.dateIso}`;
              const dDay = new Date(s.dateIso).getDay();
              const schedule = s.class.schedule_details?.find((sd) => sd.day === dDay);
              const duration = schedule ? schedule.duration : 1;
              const dayLabel = getDayName(s.dateIso);

              return (
                <li
                  key={key}
                  className="hover:bg-cyan-50/50 flex items-start gap-3 px-4 py-3 border-b border-cyan-50/50 last:border-0 transition-colors cursor-pointer"
                  onClick={() => setReadKeys((prev) => [...prev, key])}
                >
                  <div className="mt-0.5 flex flex-col items-center min-w-[50px] gap-1">
                    <div className="rounded-lg bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-cyan-800 uppercase text-center">
                      {dayLabel}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {schedule?.start_time || "Chưa set giờ"}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="text-sm font-semibold text-slate-800">
                      {s.class.class_name}
                    </div>
                    <div className="text-xs text-slate-500">
                      Học viên: {s.class.student_name}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        disabled={pendingKey === key}
                        onClick={(e) => {
                          e.stopPropagation();
                          void submitPresent(s.class.id, String(duration), s.dateIso);
                        }}
                        className="rounded-lg bg-cyan-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-cyan-700 active:scale-95 transition-all disabled:opacity-50"
                      >
                        Xác nhận ({duration}h)
                      </button>
                      <button
                        type="button"
                        disabled={pendingKey === key}
                        onClick={(e) => {
                          e.stopPropagation();
                          void submitAbsent(s.class.id, s.dateIso);
                        }}
                        className="rounded-lg bg-orange-100 px-3 py-1.5 text-[11px] font-bold text-orange-800 hover:bg-orange-200 active:scale-95 transition-all disabled:opacity-50"
                      >
                        Báo nghỉ
                      </button>
                    </div>
                  </div>
                  {!readKeys.includes(key) && (
                    <div className="mt-1.5">
                      <CircleIcon className="size-2.5 fill-cyan-500 text-cyan-500" />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}
