"use client";

import { createClass } from "./actions";
import { useState } from "react";
import type { ScheduleDetail } from "@/lib/types";
import TimePicker from "./time-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusIcon, School, User, Users, DollarSign, Calendar } from "lucide-react";
import { sonner13, sonner16 } from "@/lib/sonner-presets";

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function ClassForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<ScheduleDetail[]>([]);

  function toggleDay(day: number) {
    if (schedules.find((s) => s.day === day)) {
      setSchedules(schedules.filter((s) => s.day !== day));
    } else {
      setSchedules([...schedules, { day, start_time: "08:00", end_time: "10:00", duration: 2 }]);
    }
  }

  function updateTime(day: number, field: "start_time" | "end_time", value: string) {
    setSchedules((prev) =>
      prev.map((s) => {
        if (s.day !== day) return s;
        const newS = { ...s, [field]: value };
        const [h1, m1] = newS.start_time.split(":").map(Number);
        const [h2, m2] = newS.end_time.split(":").map(Number);
        if (!isNaN(h1) && !isNaN(h2)) {
          let diff = h2 + m2 / 60 - (h1 + m1 / 60);
          if (diff < 0) diff += 24;
          newS.duration = Math.round(diff * 100) / 100;
        }
        return newS;
      })
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("schedule_details", JSON.stringify(schedules));
    schedules.forEach((s) => fd.append("schedule", s.day.toString()));

    const res = await createClass(fd);
    setPending(false);
    if (res?.error) {
      setError(res.error);
      sonner16("Không thể thêm lớp", res.error);
    } else {
      form.reset();
      setSchedules([]);
      sonner13("Đã thêm lớp mới");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="bg-danger-light border border-danger/20 rounded-xl p-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Class Info Section */}
      <div className="bg-card-bg rounded-2xl border border-border shadow-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <School className="w-4 h-4 text-primary" />
          Thông tin lớp học
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-medium text-muted mb-1.5 block">Tên lớp / Chương trình</Label>
            <input
              name="class_name"
              required
              placeholder="Lớp 8, luyện thi IELTS..."
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-gray-50 focus:bg-white focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          <div>
            <Label className="text-xs font-medium text-muted mb-1.5 block">Chi nhánh</Label>
            <input
              name="branch_name"
              defaultValue="Cơ bản"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-gray-50 focus:bg-white focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* People Section */}
      <div className="bg-card-bg rounded-2xl border border-border shadow-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Giáo viên & Học viên
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs font-medium text-muted mb-1.5 block">Giáo viên</Label>
            <input
              name="teacher_name"
              required
              placeholder="Cô Lan, Thầy Hùng..."
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-gray-50 focus:bg-white focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          <div>
            <Label className="text-xs font-medium text-muted mb-1.5 block">Học viên</Label>
            <input
              name="student_name"
              required
              placeholder="Tên học viên"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-gray-50 focus:bg-white focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          <div>
            <Label className="text-xs font-medium text-muted mb-1.5 block">Số lượng HV</Label>
            <input
              name="student_count"
              type="number"
              min={1}
              defaultValue={1}
              required
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-gray-50 focus:bg-white focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Salary Section */}
      <div className="bg-card-bg rounded-2xl border border-border shadow-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          Mức lương
        </h3>
        <div className="max-w-xs">
          <Label className="text-xs font-medium text-muted mb-1.5 block">Lương / giờ (VNĐ)</Label>
          <input
            name="hourly_rate"
            type="number"
            min={0}
            step="1000"
            required
            placeholder="200000"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-gray-50 focus:bg-white focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Schedule Section */}
      <div className="bg-card-bg rounded-2xl border border-border shadow-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Lịch học trong tuần
        </h3>
        <div className="space-y-3">
          {[2, 3, 4, 5, 6, 7, 1].map((day) => {
            const isActive = schedules.some((s) => s.day === day);
            const schedule = schedules.find((s) => s.day === day);
            return (
              <div
                key={day}
                className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                  isActive
                    ? "border-primary/30 bg-primary-light/30"
                    : "border-border/50 bg-gray-50/50"
                }`}
              >
                <label className="flex items-center gap-3 cursor-pointer min-w-[80px]">
                  <Checkbox
                    checked={isActive}
                    onCheckedChange={() => toggleDay(day)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <span className={`text-sm font-medium ${isActive ? "text-primary" : "text-muted"}`}>
                    {DAY_LABELS[day]}
                  </span>
                </label>
                {isActive && schedule && (
                  <div className="flex items-center gap-2 flex-1">
                    <TimePicker
                      value={schedule.start_time}
                      onChange={(v) => updateTime(day, "start_time", v)}
                    />
                    <span className="text-xs text-muted">đến</span>
                    <TimePicker
                      value={schedule.end_time}
                      onChange={(v) => updateTime(day, "end_time", v)}
                    />
                    <span className="text-xs text-muted ml-2">
                      ({schedule.duration}h)
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="gap-2 px-8">
          <PlusIcon className="w-4 h-4" />
          {pending ? "Đang tạo..." : "Tạo lớp học"}
        </Button>
      </div>
    </form>
  );
}
