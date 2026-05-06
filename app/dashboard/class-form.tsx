"use client";

import { createClass } from "./actions";
import { useState } from "react";
import type { ScheduleDetail } from "@/lib/types";

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
        // calculate duration
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
    
    // Add schedule[] backward compatibility for actions.ts to read
    schedules.forEach(s => fd.append("schedule", s.day.toString()));

    const res = await createClass(fd);
    setPending(false);
    if (res?.error) setError(res.error);
    else {
      form.reset();
      setSchedules([]);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="clay-card flex flex-wrap items-end gap-4 p-5"
    >
      <label className="flex min-w-[190px] flex-col gap-1 text-sm">
        Chương trình (Tên lớp)
        <input
          name="class_name"
          required
          placeholder="Lớp 8, luyện thi IELTS..."
          className="clay-inset px-3 py-2 outline-none"
        />
      </label>
      <label className="flex min-w-[190px] flex-col gap-1 text-sm">
        Giáo viên phụ trách
        <input
          name="teacher_name"
          required
          placeholder="Cô Lan, Thầy Hùng..."
          className="clay-inset px-3 py-2 outline-none"
        />
      </label>
      <label className="flex min-w-[190px] flex-col gap-1 text-sm">
        Học viên
        <input
          name="student_name"
          required
          className="clay-inset px-3 py-2 outline-none"
        />
      </label>
      <label className="flex min-w-[190px] flex-col gap-1 text-sm">
        Lương / giờ (số)
        <input
          name="hourly_rate"
          type="text"
          inputMode="decimal"
          required
          placeholder="150000"
          className="clay-inset px-3 py-2 outline-none"
        />
      </label>

      <div className="w-full">
        <p className="mb-2 text-sm font-medium">Lịch học trong tuần & Khung giờ</p>
        
        {/* Row of days */}
        <div className="flex flex-wrap gap-2 text-sm mb-4">
          {[
            { value: 1, label: "T2" },
            { value: 2, label: "T3" },
            { value: 3, label: "T4" },
            { value: 4, label: "T5" },
            { value: 5, label: "T6" },
            { value: 6, label: "T7" },
            { value: 0, label: "CN" },
          ].map(({ value, label }) => {
            const isSelected = !!schedules.find((s) => s.day === value);
            return (
              <label 
                key={value} 
                className={`flex items-center justify-center min-w-[50px] px-3 py-2 cursor-pointer transition-all rounded-xl ${isSelected ? 'bg-cyan-600 text-white shadow-[4px_4px_8px_#b3d7da,-4px_-4px_8px_#ffffff] font-semibold' : 'clay-inset text-slate-500 hover:text-cyan-800'}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleDay(value)}
                  className="hidden"
                />
                {label}
              </label>
            );
          })}
        </div>

        {/* Selected days time inputs */}
        {schedules.length > 0 && (
          <div className="flex flex-col gap-3 text-sm bg-cyan-50/30 p-3 rounded-2xl">
            {schedules.sort((a, b) => a.day - b.day).map((schedule) => {
              const label = schedule.day === 0 ? "Chủ nhật" : `Thứ ${schedule.day + 1}`;
              return (
                <div key={schedule.day} className="flex flex-wrap items-center gap-3">
                  <span className="font-medium w-[70px] text-cyan-900">{label}:</span>
                  <div className="flex items-center gap-2">
                    Từ
                    <input
                      type="time"
                      lang="en-GB"
                      value={schedule.start_time}
                      onChange={(e) => updateTime(schedule.day, "start_time", e.target.value)}
                      className="clay-inset px-2 py-1 outline-none w-[90px]"
                      required
                    />
                    đến
                    <input
                      type="time"
                      lang="en-GB"
                      value={schedule.end_time}
                      onChange={(e) => updateTime(schedule.day, "end_time", e.target.value)}
                      className="clay-inset px-2 py-1 outline-none w-[90px]"
                      required
                    />
                    <span className="text-cyan-800 font-medium ml-2">
                      ({schedule.duration} giờ)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {error && (
        <p className="w-full text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="clay-btn px-4 py-2 text-sm disabled:opacity-60"
      >
        {pending ? "Đang tạo…" : "Thêm lớp"}
      </button>
    </form>
  );
}
