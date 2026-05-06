"use client";

import { createClass } from "./actions";
import { useState } from "react";

export default function ClassForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const res = await createClass(fd);
    setPending(false);
    if (res?.error) setError(res.error);
    else form.reset();
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
        <p className="mb-2 text-sm font-medium">Lịch học trong tuần</p>
        <div className="flex flex-wrap gap-2 text-sm">
          {[
            ["1", "T2"],
            ["2", "T3"],
            ["3", "T4"],
            ["4", "T5"],
            ["5", "T6"],
            ["6", "T7"],
            ["0", "CN"],
          ].map(([value, label]) => (
            <label key={value} className="clay-inset flex items-center gap-2 px-3 py-2">
              <input type="checkbox" name="schedule" value={value} />
              {label}
            </label>
          ))}
        </div>
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
