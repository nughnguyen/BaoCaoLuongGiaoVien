"use client";

import type { ClassRow } from "@/lib/types";
import { useState } from "react";
import { updateClass } from "./actions";

export default function ClassList({ classes }: { classes: ClassRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (classes.length === 0) {
    return (
      <div className="clay-card p-5 text-center text-sm text-slate-500">
        Chưa có lớp học nào. Hãy tạo một lớp mới!
      </div>
    );
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const res = await updateClass(fd);
    setPending(false);
    if (res?.error) setError(res.error);
    else {
      setEditingId(null);
      form.reset();
    }
  }

  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {classes.map((cls) => (
        <div key={cls.id} className="clay-card p-5">
          {editingId === cls.id ? (
            <form onSubmit={handleUpdate} className="flex flex-col gap-3">
              <input type="hidden" name="id" value={cls.id} />
              <label className="flex flex-col gap-1 text-sm">
                Chương trình (Tên lớp)
                <input
                  name="class_name"
                  defaultValue={cls.class_name}
                  required
                  className="clay-inset px-3 py-2 outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Học viên
                <input
                  name="student_name"
                  defaultValue={cls.student_name}
                  required
                  className="clay-inset px-3 py-2 outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Giáo viên phụ trách
                <input
                  name="teacher_name"
                  defaultValue={cls.teacher_name}
                  required
                  className="clay-inset px-3 py-2 outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Lương / giờ (số)
                <input
                  name="hourly_rate"
                  type="text"
                  inputMode="decimal"
                  defaultValue={cls.hourly_rate}
                  required
                  className="clay-inset px-3 py-2 outline-none"
                />
              </label>
              <div className="w-full">
                <p className="mb-2 text-sm font-medium">Lịch học</p>
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
                      <input
                        type="checkbox"
                        name="schedule"
                        value={value}
                        defaultChecked={cls.schedule.includes(Number(value))}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 shadow-[4px_4px_8px_#b3d7da,-4px_-4px_8px_#ffffff]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="clay-btn px-4 py-2 text-sm disabled:opacity-60"
                >
                  {pending ? "Đang lưu…" : "Lưu"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2 relative">
              <h3 className="font-semibold text-cyan-900">{cls.class_name}</h3>
              <p className="text-sm text-slate-700">Học viên: <span className="font-medium">{cls.student_name}</span></p>
              <p className="text-sm text-slate-700">Giáo viên: <span className="font-medium">{cls.teacher_name}</span></p>
              <p className="text-sm text-slate-700">Lương/giờ: <span className="font-medium">{Number(cls.hourly_rate).toLocaleString("vi-VN")} đ</span></p>
              <p className="text-sm text-slate-700 flex flex-wrap gap-1 items-center">
                Lịch học: 
                {cls.schedule.sort().map(s => (
                  <span key={s} className="clay-inset px-2 py-0.5 text-xs text-cyan-800">{daysOfWeek[s]}</span>
                ))}
              </p>
              
              <button
                onClick={() => setEditingId(cls.id)}
                className="absolute top-0 right-0 rounded-full w-8 h-8 flex items-center justify-center bg-cyan-100 text-cyan-700 shadow-[4px_4px_8px_#b3d7da,-4px_-4px_8px_#ffffff] hover:brightness-95"
                title="Sửa lớp học"
              >
                ✎
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
