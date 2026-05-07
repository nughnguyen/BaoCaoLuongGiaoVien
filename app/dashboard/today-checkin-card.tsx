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

type TodayClass = {
  id: string;
  student_name: string;
  class_name: string;
  hourly_rate: number;
  schedule_details?: ScheduleDetail[];
};

export default function TodayCheckinCard({ classes }: { classes: TodayClass[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState(classes.length > 0);

  useEffect(() => {
    if (classes.length === 0 || !showPopup) return;
    const timer = window.setTimeout(() => setShowPopup(false), 10_000);
    return () => window.clearTimeout(timer);
  }, [classes.length, showPopup]);

  const unread = useMemo(
    () => classes.filter((item) => !readIds.includes(item.id)).length,
    [classes, readIds],
  );

  async function submitPresent(classId: string, duration: string) {
    setPendingId(classId);
    const fd = new FormData();
    fd.set("class_id", classId);
    fd.set("duration", duration);
    const res = await markClassCompleted(fd);
    setPendingId(null);
    if (res.error) {
      sonner16("Điểm danh thất bại", res.error);
      return;
    }
    sonner13("Đã xác nhận hoàn thành ca dạy");
    setReadIds((prev) => [...prev, classId]);
  }

  async function submitAbsent(classId: string) {
    setPendingId(classId);
    const fd = new FormData();
    fd.set("class_id", classId);
    const res = await markClassAbsent(fd);
    setPendingId(null);
    if (res.error) {
      sonner16("Cập nhật nghỉ/vắng thất bại", res.error);
      return;
    }
    sonner14("Đã ghi nhận học viên vắng/nghỉ");
    setReadIds((prev) => [...prev, classId]);
  }

  const todayNum = new Date().getDay();

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-cyan-900">Nhắc lịch dạy hôm nay</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative gap-2">
              <BellIcon className="size-4" />
              Notifications
              {unread > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-2.5 -top-2.5 h-5 min-w-5 px-1 py-0 text-[11px]"
                >
                  {unread}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0">
            <div className="grid">
              <div className="flex items-center justify-between gap-2 px-4 py-2.5">
                <span className="font-medium">Thông báo lịch dạy</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-full px-2 py-1 text-xs"
                  onClick={() => setReadIds(classes.map((item) => item.id))}
                >
                  Đánh dấu đã đọc
                </Button>
              </div>
              <Separator />
              <ul className="grid gap-3 p-2">
                {classes.length === 0 && (
                  <li className="px-2 py-4 text-center text-sm text-slate-500">Hôm nay không có ca dạy.</li>
                )}
                {classes.map((item) => {
                  const todaySchedule = item.schedule_details?.find((s) => s.day === todayNum);
                  const duration = todaySchedule ? todaySchedule.duration : 1;
                  return (
                    <li
                      key={item.id}
                      className="hover:bg-cyan-50 flex items-start gap-2 rounded-lg px-2 py-2"
                      onClick={() => setReadIds((prev) => [...prev, item.id])}
                    >
                      <div className="mt-0.5 rounded-lg bg-cyan-100 px-2 py-1 text-[11px] font-semibold text-cyan-700">
                        {todaySchedule ? `${todaySchedule.start_time}` : "Hôm nay"}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="text-sm font-medium">
                          {item.class_name} - {item.student_name}
                        </div>
                        <p className="text-xs text-slate-500">
                          {todaySchedule ? `${todaySchedule.start_time} - ${todaySchedule.end_time}` : "Chưa cấu hình giờ"} | {duration}h
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            type="button"
                            disabled={pendingId === item.id}
                            onClick={() => void submitPresent(item.id, String(duration))}
                            className="rounded-xl bg-cyan-200 px-3 py-1 text-xs font-medium text-cyan-950"
                          >
                            Hoàn thành
                          </button>
                          <button
                            type="button"
                            disabled={pendingId === item.id}
                            onClick={() => void submitAbsent(item.id)}
                            className="rounded-xl bg-orange-100 px-3 py-1 text-xs font-medium text-orange-950"
                          >
                            Vắng/Nghỉ
                          </button>
                        </div>
                      </div>
                      {!readIds.includes(item.id) && <CircleIcon className="size-2 fill-cyan-500 text-cyan-500 self-center" />}
                    </li>
                  );
                })}
              </ul>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {showPopup && classes[0] && (
        <div className="fixed right-4 top-4 z-40 w-[min(420px,calc(100vw-2rem))] rounded-2xl border border-cyan-100 bg-white p-4 shadow-xl">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-cyan-900">Nhắc lịch dạy hôm nay</p>
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
            Hôm nay có <b>{classes.length}</b> ca dạy. Ca gần nhất: <b>{classes[0].class_name}</b> - {classes[0].student_name}
          </div>
        </div>
      )}

      {classes.map((item) => {
        const todaySchedule = item.schedule_details?.find((s) => s.day === todayNum);
        const duration = todaySchedule ? todaySchedule.duration : 1;
        const totalEarned = Number(item.hourly_rate) * duration;
        return (
          <div key={item.id} className="clay-card space-y-3 p-5">
            <p className="text-sm">
              Hôm nay bạn có ca dạy <b>{item.student_name}</b> ({item.class_name})
              {todaySchedule && ` từ ${todaySchedule.start_time} đến ${todaySchedule.end_time}`}. Bạn đã hoàn thành chưa?
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pendingId === item.id}
                onClick={() => void submitPresent(item.id, String(duration))}
                className="rounded-2xl bg-cyan-200 px-4 py-2 text-sm text-cyan-950 shadow-[6px_6px_14px_#a5e2eb,-4px_-4px_12px_#ffffff] font-medium"
              >
                Hoàn thành ca dạy ({duration}h)
              </button>
              <button
                type="button"
                disabled={pendingId === item.id}
                onClick={() => void submitAbsent(item.id)}
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
    </section>
  );
}
