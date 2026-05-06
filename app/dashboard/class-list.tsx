"use client";

import type { ClassRow, ScheduleDetail } from "@/lib/types";
import { useState } from "react";
import { updateClass, addManualLog } from "./actions";

export default function ClassList({ classes }: { classes: ClassRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  
  if (classes.length === 0) {
    return (
      <div className="clay-card p-5 text-center text-sm text-slate-500">
        Chưa có lớp học nào. Hãy tạo một lớp mới!
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {classes.map((cls) => (
        <ClassCard key={cls.id} cls={cls} isEditing={editingId === cls.id} setEditingId={setEditingId} />
      ))}
    </div>
  );
}

function ClassCard({ cls, isEditing, setEditingId }: { cls: ClassRow, isEditing: boolean, setEditingId: (id: string | null) => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<ScheduleDetail[]>(cls.schedule_details || []);
  
  const [manualDate, setManualDate] = useState("");
  const [manualDuration, setManualDuration] = useState("");
  const [manualPending, setManualPending] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [manualSuccess, setManualSuccess] = useState<string | null>(null);

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

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("schedule_details", JSON.stringify(schedules));
    schedules.forEach(s => fd.append("schedule", s.day.toString()));

    const res = await updateClass(fd);
    setPending(false);
    if (res?.error) setError(res.error);
    else {
      setEditingId(null);
    }
  }

  async function handleManualSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setManualError(null);
    setManualSuccess(null);
    setManualPending(true);
    const fd = new FormData();
    fd.set("class_id", cls.id);
    fd.set("date", manualDate);
    fd.set("duration", manualDuration);
    
    const res = await addManualLog(fd);
    setManualPending(false);
    if (res?.error) {
      setManualError(res.error);
    } else {
      setManualSuccess("Đã lưu thành công!");
      setManualDate("");
      setManualDuration("");
    }
  }

  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  if (isEditing) {
    return (
      <div className="clay-card p-5 space-y-6">
        <form onSubmit={handleUpdate} className="flex flex-col gap-3">
          <h3 className="font-semibold text-cyan-900 border-b pb-2">Sửa thông tin lớp</h3>
          <input type="hidden" name="id" value={cls.id} />
          <label className="flex flex-col gap-1 text-sm">
            Chương trình (Tên lớp)
            <input name="class_name" defaultValue={cls.class_name} required className="clay-inset px-3 py-2 outline-none" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Học viên
            <input name="student_name" defaultValue={cls.student_name} required className="clay-inset px-3 py-2 outline-none" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Giáo viên phụ trách
            <input name="teacher_name" defaultValue={cls.teacher_name} required className="clay-inset px-3 py-2 outline-none" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Lương / giờ (số)
            <input name="hourly_rate" type="text" inputMode="decimal" defaultValue={cls.hourly_rate} required className="clay-inset px-3 py-2 outline-none" />
          </label>
          <div className="w-full">
            <p className="mb-2 text-sm font-medium">Lịch học trong tuần & Khung giờ</p>
            
            {/* Row of days */}
            <div className="flex flex-wrap gap-2 text-sm mb-4">
              {[
                { value: 1, label: "T2" }, { value: 2, label: "T3" }, { value: 3, label: "T4" },
                { value: 4, label: "T5" }, { value: 5, label: "T6" }, { value: 6, label: "T7" },
                { value: 0, label: "CN" },
              ].map(({ value, label }) => {
                const isSelected = !!schedules.find((s) => s.day === value);
                return (
                  <label 
                    key={value} 
                    className={`flex items-center justify-center min-w-[40px] px-3 py-2 cursor-pointer transition-all rounded-xl ${isSelected ? 'bg-cyan-600 text-white shadow-[4px_4px_8px_#b3d7da,-4px_-4px_8px_#ffffff] font-semibold' : 'clay-inset text-slate-500 hover:text-cyan-800'}`}
                  >
                    <input type="checkbox" checked={isSelected} onChange={() => toggleDay(value)} className="hidden" />
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
                      <div className="flex items-center gap-1 text-xs sm:text-sm">
                        Từ
                        <input type="time" lang="en-GB" value={schedule.start_time} onChange={(e) => updateTime(schedule.day, "start_time", e.target.value)} className="clay-inset px-1 py-1 outline-none w-[75px] sm:w-[90px]" required />
                        đến
                        <input type="time" lang="en-GB" value={schedule.end_time} onChange={(e) => updateTime(schedule.day, "end_time", e.target.value)} className="clay-inset px-1 py-1 outline-none w-[75px] sm:w-[90px]" required />
                        <span className="text-cyan-800 font-medium ml-1">({schedule.duration} giờ)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end mt-2">
            <button type="button" onClick={() => setEditingId(null)} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 shadow-[4px_4px_8px_#b3d7da,-4px_-4px_8px_#ffffff]">Hủy</button>
            <button type="submit" disabled={pending} className="clay-btn px-4 py-2 text-sm disabled:opacity-60">{pending ? "Đang lưu…" : "Lưu"}</button>
          </div>
        </form>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-cyan-900 mb-3">Nhập ca dạy thủ công</h3>
          <form onSubmit={handleManualSubmit} className="flex flex-col gap-3">
            <div className="flex gap-3 flex-wrap">
              <label className="flex flex-col gap-1 text-sm flex-1 min-w-[120px]">
                Ngày dạy
                <input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} required className="clay-inset px-3 py-2 outline-none" />
              </label>
              <label className="flex flex-col gap-1 text-sm flex-1 min-w-[120px]">
                Số giờ (vd: 1.5)
                <input type="number" step="0.25" min="0.25" value={manualDuration} onChange={(e) => setManualDuration(e.target.value)} required className="clay-inset px-3 py-2 outline-none" />
              </label>
            </div>
            {manualError && <p className="text-sm text-red-600">{manualError}</p>}
            {manualSuccess && <p className="text-sm text-emerald-600 font-medium">{manualSuccess}</p>}
            <button type="submit" disabled={manualPending} className="clay-inset bg-cyan-50 px-4 py-2 text-sm text-cyan-800 font-medium disabled:opacity-60 mt-1">
              {manualPending ? "Đang lưu..." : "+ Thêm ca dạy quá khứ"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="clay-card p-5 space-y-2 relative">
      <h3 className="font-semibold text-cyan-900">{cls.class_name}</h3>
      <p className="text-sm text-slate-700">Học viên: <span className="font-medium">{cls.student_name}</span></p>
      <p className="text-sm text-slate-700">Giáo viên: <span className="font-medium">{cls.teacher_name}</span></p>
      <p className="text-sm text-slate-700">Lương/giờ: <span className="font-medium">{Number(cls.hourly_rate).toLocaleString("vi-VN")} đ</span></p>
      <div className="text-sm text-slate-700">
        <p className="mb-1">Lịch học:</p>
        <div className="flex flex-col gap-1 pl-2">
          {cls.schedule_details && cls.schedule_details.length > 0 ? (
            cls.schedule_details.map(s => (
              <span key={s.day} className="text-xs text-cyan-800 bg-cyan-50/50 rounded px-2 py-1 inline-block border border-cyan-100/50 w-fit">
                <b>{daysOfWeek[s.day]}</b>: {s.start_time} - {s.end_time} ({s.duration}h)
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">Chưa thiết lập giờ</span>
          )}
        </div>
      </div>
      
      <button
        onClick={() => setEditingId(cls.id)}
        className="absolute top-2 right-2 rounded-full w-8 h-8 flex items-center justify-center bg-cyan-100 text-cyan-700 shadow-[4px_4px_8px_#b3d7da,-4px_-4px_8px_#ffffff] hover:brightness-95"
        title="Sửa lớp học"
      >
        ✎
      </button>
    </div>
  );
}
