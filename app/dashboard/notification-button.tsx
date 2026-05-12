"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BellIcon, CheckCircle2, XCircle } from "lucide-react";
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
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateIso === yesterday.toISOString().slice(0, 10)) return "Hôm qua";
    return new Date(dateIso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
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
      sonner16("Cập nhật thất bại", res.error);
      return;
    }
    sonner14("Đã ghi nhận học viên vắng/nghỉ");
    setReadKeys((prev) => [...prev, key]);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative w-10 h-10 rounded-xl border border-border bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
          <BellIcon className="w-[18px] h-[18px] text-muted" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 border-border shadow-lg rounded-2xl overflow-hidden" align="end">
        <div className="px-4 py-3 border-b border-border bg-gray-50/50">
          <span className="text-sm font-semibold text-foreground">Thông báo lịch dạy</span>
        </div>
        <div className="max-h-[360px] overflow-y-auto">
          {pendingSessions.length === 0 ? (
            <div className="p-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="text-sm text-muted">Không có ca nào cần điểm danh</p>
            </div>
          ) : (
            pendingSessions.map((session) => {
              const key = `${session.class.id}-${session.dateIso}`;
              const isRead = readKeys.includes(key);
              const isPending = pendingKey === key;
              if (isRead) return null;

              return (
                <div key={key} className="px-4 py-3 border-b border-border/50 last:border-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{session.class.class_name}</p>
                      <p className="text-xs text-muted">{session.class.student_name}</p>
                    </div>
                    <Badge variant={session.dateIso === new Date().toISOString().slice(0, 10) ? "default" : "outline"} className="text-[10px] shrink-0">
                      {getDayName(session.dateIso)}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => submitPresent(session.class.id, "2", session.dateIso)}
                      disabled={isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium bg-success text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Hoàn thành
                    </button>
                    <button
                      onClick={() => submitAbsent(session.class.id, session.dateIso)}
                      disabled={isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border border-danger/20 text-danger hover:bg-danger-light transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3 h-3" />
                      Vắng
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
