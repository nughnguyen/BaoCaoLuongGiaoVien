"use client";

import { useState } from "react";
import { SearchIcon, PencilIcon, ClockIcon, PlusIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ClassRow, ScheduleDetail } from "@/lib/types";
import { updateClass, addManualLog } from "./actions";
import TimePicker from "./time-picker";
import { sonner13, sonner16 } from "@/lib/sonner-presets";

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function ClassList({ classes }: { classes: ClassRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [manualId, setManualId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [manualDate, setManualDate] = useState(new Date().toISOString().slice(0, 10));
  const [manualStartTime, setManualStartTime] = useState("19:00");
  const [manualEndTime, setManualEndTime] = useState("20:00");

  const filtered = classes.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.class_name.toLowerCase().includes(q) ||
      c.student_name.toLowerCase().includes(q) ||
      (c.teacher_name || "").toLowerCase().includes(q)
    );
  });

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>, classId: string) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("class_id", classId);
    const res = await updateClass(fd);
    if (res?.error) {
      sonner16("Cập nhật thất bại", res.error);
    } else {
      sonner13("Đã cập nhật lớp học");
      setEditingId(null);
    }
  }

  async function handleManualLog(classId: string) {
    const fd = new FormData();
    fd.set("class_id", classId);
    fd.set("date", manualDate);
    fd.set("start_time", manualStartTime);
    fd.set("end_time", manualEndTime);
    const res = await addManualLog(fd);
    if (res?.error) {
      sonner16("Thêm ca dạy thất bại", res.error);
    } else {
      sonner13("Đã thêm ca dạy thủ công");
      setManualId(null);
    }
  }

  return (
    <div className="bg-card-bg rounded-2xl border border-border shadow-card overflow-hidden">
      {/* Search */}
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light" />
          <input
            type="text"
            placeholder="Tìm lớp, học viên, giáo viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-gray-50 focus:bg-white focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <span className="text-xs text-muted">{filtered.length} lớp</span>
      </div>

      {/* Class Cards */}
      <div className="p-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted text-sm">
            {searchQuery ? "Không tìm thấy lớp nào" : "Chưa có lớp học nào"}
          </div>
        ) : (
          filtered.map((cls) => (
            <div
              key={cls.id}
              className="border border-border rounded-xl p-4 hover:shadow-card-hover transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-foreground">{cls.class_name}</h4>
                    <Badge variant="outline" className="text-[10px]">
                      {cls.branch_name || "Cơ bản"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted mt-1">
                    <span>👨‍🎓 {cls.student_name} ({cls.student_count} HV)</span>
                    <span>👩‍🏫 {cls.teacher_name}</span>
                    <span className="font-medium text-success">
                      💰 {Number(cls.hourly_rate).toLocaleString("vi-VN")}đ/h
                    </span>
                  </div>
                  {cls.schedule_details && cls.schedule_details.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {cls.schedule_details.map((s) => (
                        <Badge
                          key={s.day}
                          variant="default"
                          className="text-[10px]"
                        >
                          {DAY_LABELS[s.day]} {s.start_time}–{s.end_time}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setManualId(manualId === cls.id ? null : cls.id)}
                    className="gap-1.5"
                  >
                    <ClockIcon className="size-3.5" />
                    Thêm ca
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingId(editingId === cls.id ? null : cls.id)}
                    className="gap-1.5"
                  >
                    <PencilIcon className="size-3.5" />
                    Sửa
                  </Button>
                </div>
              </div>

              {/* Manual Log Form */}
              {manualId === cls.id && (
                <div className="mt-4 pt-4 border-t border-border/50 flex items-end gap-3">
                  <div>
                    <label className="text-xs text-muted mb-1 block">Ngày</label>
                    <input
                      type="date"
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                      className="px-3 py-2 text-sm rounded-xl border border-border bg-gray-50 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1 block">Bắt đầu</label>
                    <TimePicker
                      value={manualStartTime}
                      onChange={setManualStartTime}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1 block">Kết thúc</label>
                    <TimePicker
                      value={manualEndTime}
                      onChange={setManualEndTime}
                    />
                  </div>
                  <Button size="sm" onClick={() => handleManualLog(cls.id)} className="gap-1.5">
                    <PlusIcon className="size-3.5" />
                    Thêm
                  </Button>
                </div>
              )}

              {/* Edit Form */}
              {editingId === cls.id && (
                <form
                  onSubmit={(e) => handleUpdate(e, cls.id)}
                  className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  <div>
                    <label className="text-xs text-muted mb-1 block">Tên lớp</label>
                    <input
                      name="class_name"
                      defaultValue={cls.class_name}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-gray-50 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1 block">Học viên</label>
                    <input
                      name="student_name"
                      defaultValue={cls.student_name}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-gray-50 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1 block">Giáo viên</label>
                    <input
                      name="teacher_name"
                      defaultValue={cls.teacher_name}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-gray-50 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1 block">Lương/giờ</label>
                    <input
                      name="hourly_rate"
                      type="number"
                      step="1000"
                      defaultValue={cls.hourly_rate}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-gray-50 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                      Hủy
                    </Button>
                    <Button type="submit" size="sm">
                      Lưu thay đổi
                    </Button>
                  </div>
                </form>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
