"use client";

import { Input } from "@/components/ui/input";

interface TimePickerProps {
  value: string; // "HH:MM"
  onChange: (value: string) => void;
  id?: string;
}

export default function TimePicker({ value, onChange, id }: TimePickerProps) {
  return (
    <Input
      id={id}
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      // Ẩn calendar picker indicator để trình duyệt hiển thị text thuần 24h
      className="w-[110px] bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none clay-inset border-0 px-3 py-2 text-sm font-medium text-cyan-900 shadow-none focus-visible:ring-0"
      aria-label={id?.startsWith("start") ? "Giờ bắt đầu" : "Giờ kết thúc"}
    />
  );
}
