"use client";

export default function TimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-1.5 text-sm rounded-lg border border-border bg-white focus:border-primary focus:outline-none transition-colors"
    />
  );
}
