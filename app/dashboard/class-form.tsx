"use client";

import { createClass } from "./actions";
import { useState } from "react";
import type { ScheduleDetail } from "@/lib/types";
import TimePicker from "./time-picker";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusIcon, GraduationCap, Users, Banknote, CalendarDays, MapPin } from "lucide-react";
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
    <form onSubmit={onSubmit} className="bg-card-bg rounded-3xl border border-border shadow-2xl shadow-primary/5 p-8 space-y-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
        <PlusIcon className="w-32 h-32 text-primary" />
      </div>

      {error && (
        <div className="bg-danger-light border border-danger/20 rounded-2xl p-4 text-sm text-danger animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
              <div className="p-1.5 rounded-lg bg-primary-light text-primary">
                <GraduationCap className="w-4 h-4" />
              </div>
              Thông tin khóa học
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-muted-light uppercase ml-1">Tên lớp / Chương trình</Label>
                <input
                  name="class_name"
                  required
                  placeholder="Lớp 8, luyện thi IELTS..."
                  className="w-full px-5 py-3 text-sm rounded-2xl border border-border bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-muted-light uppercase ml-1">Chi nhánh</Label>
                <div className="relative">
                  <input
                    name="branch_name"
                    required
                    placeholder="Nhập chi nhánh..."
                    className="w-full pl-11 pr-5 py-3 text-sm rounded-2xl border border-border bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all"
                  />
                  <MapPin className="w-4 h-4 text-muted-light absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
              <div className="p-1.5 rounded-lg bg-success-light text-success">
                <Users className="w-4 h-4" />
              </div>
              Nhân sự & Học viên
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-muted-light uppercase ml-1">Giáo viên</Label>
                <input
                  name="teacher_name"
                  required
                  placeholder="Thầy/Cô..."
                  className="w-full px-5 py-3 text-sm rounded-2xl border border-border bg-gray-50 focus:bg-white focus:border-primary focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-muted-light uppercase ml-1">Học viên</Label>
                <input
                  name="student_name"
                  required
                  placeholder="Tên học viên..."
                  className="w-full px-5 py-3 text-sm rounded-2xl border border-border bg-gray-50 focus:bg-white focus:border-primary focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-muted-light uppercase ml-1">Số lượng HV</Label>
                <input
                  name="student_count"
                  type="number"
                  min={1}
                  defaultValue={1}
                  required
                  className="w-full px-5 py-3 text-sm rounded-2xl border border-border bg-gray-50 focus:bg-white focus:border-primary focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-muted-light uppercase ml-1">Lương / giờ</Label>
                <div className="relative">
                  <input
                    name="hourly_rate"
                    type="number"
                    min={0}
                    step="1000"
                    required
                    placeholder="200,000"
                    className="w-full pl-11 pr-5 py-3 text-sm rounded-2xl border border-border bg-gray-50 focus:bg-white focus:border-primary focus:outline-none transition-all"
                  />
                  <Banknote className="w-4 h-4 text-muted-light absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
            <div className="p-1.5 rounded-lg bg-accent-purple/10 text-accent-purple">
              <CalendarDays className="w-4 h-4" />
            </div>
            Lịch học định kỳ
          </h3>
          
          <div className="bg-gray-50/50 rounded-3xl p-6 border border-border/50">
            <Label className="text-[11px] font-bold text-muted-light uppercase mb-3 block">Chọn các ngày trong tuần</Label>
            <div className="flex flex-wrap gap-2 mb-6">
              {[2, 3, 4, 5, 6, 7, 1].map((day) => {
                const isActive = schedules.some((s) => s.day === day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`flex-1 min-w-[50px] py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
                      isActive
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/25 scale-105"
                        : "bg-white border-border text-muted hover:border-primary/50 hover:text-primary"
                    }`}
                  >
                    {DAY_LABELS[day]}
                  </button>
                );
              })}
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
              {schedules.sort((a, b) => {
                const order = [2, 3, 4, 5, 6, 7, 1];
                return order.indexOf(a.day) - order.indexOf(b.day);
              }).map((s) => (
                <div
                  key={s.day}
                  className="flex items-center justify-between gap-4 p-3.5 bg-white border border-border rounded-2xl animate-in zoom-in-95 duration-200"
                >
                  <span className="text-xs font-bold text-primary w-8">{DAY_LABELS[s.day]}</span>
                  <div className="flex items-center gap-2">
                    <TimePicker
                      value={s.start_time}
                      onChange={(v) => updateTime(s.day, "start_time", v)}
                    />
                    <span className="text-[10px] font-bold text-muted-light uppercase">đến</span>
                    <TimePicker
                      value={s.end_time}
                      onChange={(v) => updateTime(s.day, "end_time", v)}
                    />
                  </div>
                  <div className="text-[10px] font-bold px-2 py-1 bg-primary-light text-primary rounded-lg">
                    {s.duration}h
                  </div>
                </div>
              ))}
              {schedules.length === 0 && (
                <div className="h-24 flex flex-col items-center justify-center text-muted-light border-2 border-dashed border-border rounded-2xl bg-white/50">
                  <CalendarDays className="w-6 h-6 mb-2 opacity-20" />
                  <p className="text-[11px] font-medium">Chưa chọn ngày học</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-border/50">
        <Button 
          type="submit" 
          disabled={pending} 
          className="h-12 px-10 rounded-2xl bg-gradient-to-r from-primary to-accent-blue hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 font-bold tracking-tight gap-2"
        >
          {pending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <PlusIcon className="w-5 h-5" />
          )}
          {pending ? "Đang tạo..." : "Tạo lớp học ngay"}
        </Button>
      </div>
    </form>
  );
}
