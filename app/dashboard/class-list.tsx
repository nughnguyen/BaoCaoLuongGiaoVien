"use client";

import { Fragment, useId, useState } from "react";
import { SearchIcon, PencilIcon, XIcon, CheckIcon, ClockIcon, PlusIcon } from "lucide-react";
import type { Column, ColumnDef, ColumnFiltersState, RowData, SortingState } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ClassRow, ScheduleDetail } from "@/lib/types";
import { updateClass, addManualLog } from "./actions";
import TimePicker from "./time-picker";
import { sonner13, sonner16 } from "@/lib/sonner-presets";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text" | "select";
  }
}

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function ClassList({ classes }: { classes: ClassRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [manualId, setManualId] = useState<string | null>(null);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([{ id: "class_name", desc: false }]);

  const columns: ColumnDef<ClassRow>[] = [
    {
      header: "Tên lớp",
      accessorKey: "class_name",
      cell: ({ row }) => (
        <div className="font-semibold text-cyan-900">{row.getValue("class_name")}</div>
      ),
      meta: { filterVariant: "text" },
    },
    {
      header: "Học viên",
      accessorKey: "student_name",
      cell: ({ row }) => <span>{row.getValue("student_name")}</span>,
      meta: { filterVariant: "text" },
    },
    {
      header: "Giáo viên",
      accessorKey: "teacher_name",
      cell: ({ row }) => <span>{row.getValue("teacher_name")}</span>,
      meta: { filterVariant: "text" },
    },
    {
      header: "Chi nhánh",
      accessorKey: "branch_name",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
          {row.getValue("branch_name") || "Cơ bản"}
        </Badge>
      ),
      meta: { filterVariant: "text" },
    },
    {
      header: "Lương/giờ",
      accessorKey: "hourly_rate",
      cell: ({ row }) => (
        <span className="font-medium text-emerald-700">
          {Number(row.getValue("hourly_rate")).toLocaleString("vi-VN")}đ
        </span>
      ),
    },
    {
      header: "Lịch học",
      accessorKey: "schedule_details",
      enableSorting: false,
      cell: ({ row }) => {
        const details = row.original.schedule_details;
        if (!details || details.length === 0)
          return <span className="text-xs text-slate-400 italic">Chưa thiết lập</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {details.map((s) => (
              <Badge
                key={s.day}
                className="text-[10px] font-medium bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100"
              >
                {DAY_LABELS[s.day]} {s.start_time}–{s.end_time}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <button
            title="Thêm ca dạy thủ công"
            onClick={() => setManualId(manualId === row.original.id ? null : row.original.id)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
          >
            <PlusIcon size={13} />
          </button>
          <button
            title="Sửa lớp"
            onClick={() => setEditingId(editingId === row.original.id ? null : row.original.id)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-cyan-50 text-cyan-600 hover:bg-cyan-100 transition-colors"
          >
            <PencilIcon size={13} />
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: classes,
    columns,
    state: { sorting, columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
  });

  if (classes.length === 0) {
    return (
      <div className="clay-card p-10 text-center text-sm text-slate-400">
        <ClockIcon className="mx-auto mb-3 text-slate-300" size={32} />
        Chưa có lớp học nào. Hãy tạo một lớp mới!
      </div>
    );
  }

  return (
    <div className="clay-card overflow-hidden">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 px-4 py-4 border-b border-cyan-100/50">
        <TableFilter column={table.getColumn("class_name")!} placeholder="Tìm tên lớp…" />
        <TableFilter column={table.getColumn("student_name")!} placeholder="Tìm học viên…" />
        <TableFilter column={table.getColumn("teacher_name")!} placeholder="Tìm giáo viên…" />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-cyan-50/40 hover:bg-cyan-50/40">
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-cyan-800 text-xs font-semibold uppercase tracking-wide h-10 select-none cursor-pointer"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === "asc" && " ↑"}
                      {header.column.getIsSorted() === "desc" && " ↓"}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow
                    key={row.id}
                    className="hover:bg-cyan-50/30 transition-colors"
                    data-state={
                      editingId === row.original.id || manualId === row.original.id
                        ? "selected"
                        : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Inline edit panel */}
                  {editingId === row.original.id && (
                    <TableRow key={`edit-${row.id}`} className="bg-cyan-50/20 hover:bg-cyan-50/20">
                      <TableCell colSpan={columns.length} className="py-4 px-6">
                        <EditPanel cls={row.original} onClose={() => setEditingId(null)} />
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Inline manual log panel */}
                  {manualId === row.original.id && (
                    <TableRow key={`manual-${row.id}`} className="bg-emerald-50/20 hover:bg-emerald-50/20">
                      <TableCell colSpan={columns.length} className="py-4 px-6">
                        <ManualLogPanel classId={row.original.id} onClose={() => setManualId(null)} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-slate-400">
                  Không tìm thấy kết quả phù hợp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-slate-400 text-center py-3 border-t border-cyan-100/40">
        {table.getFilteredRowModel().rows.length} / {classes.length} lớp học
      </p>
    </div>
  );
}

/* ── Filter component ────────────────────────────────────────── */
function TableFilter({
  column,
  placeholder,
}: {
  column: Column<ClassRow, unknown>;
  placeholder: string;
}) {
  const id = useId();
  const value = (column.getFilterValue() ?? "") as string;

  return (
    <div className="relative min-w-[140px]">
      <Input
        id={id}
        value={value}
        onChange={(e) => column.setFilterValue(e.target.value)}
        placeholder={placeholder}
        className="pl-8 h-8 text-xs"
      />
      <SearchIcon
        size={13}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
    </div>
  );
}

/* ── Edit Panel ──────────────────────────────────────────────── */
function EditPanel({ cls, onClose }: { cls: ClassRow; onClose: () => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<ScheduleDetail[]>(cls.schedule_details || []);

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("schedule_details", JSON.stringify(schedules));
    schedules.forEach((s) => fd.append("schedule", s.day.toString()));
    const res = await updateClass(fd);
    setPending(false);
    if (res?.error) {
      setError(res.error);
      sonner16("Cập nhật lớp thất bại", res.error);
    } else {
      sonner13("Đã cập nhật thông tin lớp");
      onClose();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-semibold text-cyan-900 text-sm">Chỉnh sửa: {cls.class_name}</h4>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <XIcon size={16} />
        </button>
      </div>

      <input type="hidden" name="id" value={cls.id} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        <div className="grid gap-1">
          <Label className="text-xs">Tên lớp</Label>
          <Input name="class_name" defaultValue={cls.class_name} required className="h-8 text-sm" />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Học viên</Label>
          <Input name="student_name" defaultValue={cls.student_name} required className="h-8 text-sm" />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Số lượng HV</Label>
          <Input name="student_count" type="number" min={1} defaultValue={cls.student_count ?? 1} required className="h-8 text-sm" />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Chi nhánh</Label>
          <Input name="branch_name" defaultValue={cls.branch_name ?? "Cơ bản"} required className="h-8 text-sm" />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Giáo viên</Label>
          <Input name="teacher_name" defaultValue={cls.teacher_name} required className="h-8 text-sm" />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Lương/giờ</Label>
          <Input
            name="hourly_rate"
            type="text"
            inputMode="decimal"
            defaultValue={cls.hourly_rate}
            required
            className="h-8 text-sm"
          />
        </div>
      </div>

      {/* Day picker */}
      <div>
        <Label className="text-xs mb-2 block">Lịch học trong tuần</Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {[{ v: 1, l: "T2" }, { v: 2, l: "T3" }, { v: 3, l: "T4" }, { v: 4, l: "T5" }, { v: 5, l: "T6" }, { v: 6, l: "T7" }, { v: 0, l: "CN" }].map(({ v, l }) => {
            const sel = !!schedules.find((s) => s.day === v);
            return (
              <label
                key={v}
                className={`flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer text-sm font-medium transition-all ${
                  sel ? "bg-cyan-600 text-white shadow-md" : "clay-inset text-slate-500 hover:text-cyan-800"
                }`}
              >
                <input type="checkbox" checked={sel} onChange={() => toggleDay(v)} className="hidden" />
                {l}
              </label>
            );
          })}
        </div>

        {schedules.length > 0 && (
          <div className="flex flex-col gap-2 bg-cyan-50/40 p-3 rounded-xl">
            {[...schedules].sort((a, b) => a.day - b.day).map((s) => {
              const lbl = s.day === 0 ? "CN" : `T${s.day + 1}`;
              const lblFull = s.day === 0 ? "Chủ nhật" : `Thứ ${s.day + 1}`;
              return (
                <div
                  key={s.day}
                  className="grid items-center gap-2"
                  style={{ gridTemplateColumns: "2.5rem 1fr auto" }}
                >
                  <span className="text-xs font-semibold text-cyan-800 bg-cyan-100/70 text-center py-1 rounded-lg">
                    {lbl}
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <TimePicker
                      id={`edit-start-${s.day}`}
                      value={s.start_time}
                      onChange={(v) => updateTime(s.day, "start_time", v)}
                    />
                    <span className="text-slate-400 text-xs">→</span>
                    <TimePicker
                      id={`edit-end-${s.day}`}
                      value={s.end_time}
                      onChange={(v) => updateTime(s.day, "end_time", v)}
                    />
                    <span className="text-cyan-700 text-xs font-semibold bg-cyan-100/60 px-2 py-0.5 rounded-full">
                      {s.duration}h
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleDay(s.day)}
                    title={`Xóa ca ${lblFull}`}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-red-400 transition-colors text-xs shrink-0"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 text-sm rounded-xl text-slate-600 clay-inset"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={pending}
          className="clay-btn px-4 py-1.5 text-sm flex items-center gap-2 disabled:opacity-60"
        >
          <CheckIcon size={14} />
          {pending ? "Đang lưu…" : "Lưu"}
        </button>
      </div>
    </form>
  );
}

/* ── Manual Log Panel ────────────────────────────────────────── */
function ManualLogPanel({ classId, onClose }: { classId: string; onClose: () => void }) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Calculate duration whenever startTime or endTime changes
  const calculateDuration = () => {
    const [h1, m1] = startTime.split(":").map(Number);
    const [h2, m2] = endTime.split(":").map(Number);
    if (isNaN(h1) || isNaN(h2)) return 0;
    let diff = (h2 + m2 / 60) - (h1 + m1 / 60);
    if (diff < 0) diff += 24;
    return Math.round(diff * 100) / 100;
  };

  const duration = calculateDuration();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setPending(true);
    const fd = new FormData();
    fd.set("class_id", classId);
    fd.set("date", date);
    fd.set("duration", duration.toString());
    const res = await addManualLog(fd);
    setPending(false);
    if (res?.error) {
      setError(res.error);
      sonner16("Thêm ca thủ công thất bại", res.error);
    } else {
      setSuccess("Đã lưu thành công!");
      setDate("");
      sonner13("Đã thêm ca dạy thủ công");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-semibold text-emerald-800 text-sm flex items-center gap-2">
          <PlusIcon size={14} />
          Nhập ca dạy thủ công
        </h4>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <XIcon size={16} />
        </button>
      </div>

      <div className="flex gap-4 flex-wrap items-end">
        <div className="grid gap-1 flex-1 min-w-[140px]">
          <Label className="text-xs">Ngày dạy</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="h-9 text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100">
          <div className="grid gap-1">
            <Label className="text-[10px] text-emerald-700">Bắt đầu</Label>
            <TimePicker
              id="manual-start"
              value={startTime}
              onChange={setStartTime}
            />
          </div>
          <span className="text-emerald-300 mt-4">→</span>
          <div className="grid gap-1">
            <Label className="text-[10px] text-emerald-700">Kết thúc</Label>
            <TimePicker
              id="manual-end"
              value={endTime}
              onChange={setEndTime}
            />
          </div>
          <div className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold mt-4">
            {duration}h
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600 font-medium">{success}</p>}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 text-sm rounded-xl text-slate-600 clay-inset"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={pending}
          className="clay-btn px-4 py-1.5 text-sm flex items-center gap-2 disabled:opacity-60"
        >
          <CheckIcon size={14} />
          {pending ? "Đang lưu…" : "Thêm ca"}
        </button>
      </div>
    </form>
  );
}
