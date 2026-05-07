"use client";

import { createClass } from "./actions";
import { useState } from "react";
import type { ScheduleDetail } from "@/lib/types";
import TimePicker from "./time-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AnimatePresence, easeOut, motion } from "motion/react";
import { sonner13, sonner16 } from "@/lib/sonner-presets";

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
    if (res?.error) {
      setError(res.error);
      sonner16("Không thể thêm lớp", res.error);
    }
    else {
      form.reset();
      setSchedules([]);
      sonner13("Đã thêm lớp mới");
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
              <ConfettiCheckbox
                key={value}
                checked={isSelected}
                label={label}
                onChange={() => {
                  toggleDay(value);
                }}
              />
            );
          })}
        </div>

        {/* Selected days time inputs */}
        {schedules.length > 0 && (
          <div className="flex flex-col gap-2 text-sm bg-cyan-50/30 p-3 rounded-2xl">
            {[...schedules].sort((a, b) => a.day - b.day).map((schedule) => {
              const label = schedule.day === 0 ? "CN" : `T${schedule.day + 1}`;
              const labelFull = schedule.day === 0 ? "Chủ nhật" : `Thứ ${schedule.day + 1}`;
              return (
                <div
                  key={schedule.day}
                  className="grid items-center gap-2 py-1"
                  style={{ gridTemplateColumns: "3rem 1fr auto" }}
                >
                  {/* Label */}
                  <span className="font-semibold text-cyan-800 text-xs bg-cyan-100/70 text-center px-1 py-1 rounded-lg">
                    {label}
                  </span>

                  {/* Time pickers */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <TimePicker
                      id={`start-${schedule.day}`}
                      value={schedule.start_time}
                      onChange={(v) => updateTime(schedule.day, "start_time", v)}
                    />
                    <span className="text-slate-400 text-xs select-none">→</span>
                    <TimePicker
                      id={`end-${schedule.day}`}
                      value={schedule.end_time}
                      onChange={(v) => updateTime(schedule.day, "end_time", v)}
                    />
                    <span className="text-cyan-700 font-semibold text-xs bg-cyan-100/60 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {schedule.duration}h
                    </span>
                  </div>

                  {/* Nút xóa ca — luôn cố định bên phải */}
                  <button
                    type="button"
                    onClick={() => toggleDay(schedule.day)}
                    title={`Xóa ca ${labelFull}`}
                    aria-label={`Xóa ca ${labelFull}`}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-red-400 active:bg-red-500 transition-all duration-150 text-xs font-bold shrink-0"
                  >
                    ✕
                  </button>
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

function particleAnimation(index: number) {
  const angle = Math.random() * Math.PI * 2;
  const distance = 24 + Math.random() * 16;
  return {
    initial: { x: "50%", y: "50%", scale: 0, opacity: 0 },
    animate: {
      x: `calc(50% + ${Math.cos(angle) * distance}px)`,
      y: `calc(50% + ${Math.sin(angle) * distance}px)`,
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
    },
    transition: { duration: 0.4, delay: index * 0.04, ease: easeOut },
  };
}

function ConfettiCheckbox({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  const [showConfetti, setShowConfetti] = useState(false);
  const id = `day-${label}`;
  return (
    <div
      className={`relative flex items-center gap-2 rounded-xl px-2 py-1.5 ${
        checked ? "bg-cyan-600 text-white shadow-md" : "clay-inset text-slate-500"
      }`}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => {
          if (value) {
            setShowConfetti(true);
            window.setTimeout(() => setShowConfetti(false), 800);
          }
          onChange();
        }}
        className="border-white/60 data-[state=checked]:bg-white data-[state=checked]:text-cyan-700"
      />
      <Label htmlFor={id} className="cursor-pointer text-xs font-semibold">
        {label}
      </Label>
      <AnimatePresence>
        {showConfetti && (
          <div className="pointer-events-none absolute inset-0">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute size-1 rounded-full"
                style={{ backgroundColor: ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"][i % 6] }}
                {...particleAnimation(i)}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
