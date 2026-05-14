"use client";

import { useState, useMemo } from "react";
import { Trash2Icon, ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { sonner13, sonner16 } from "@/lib/sonner-presets";
import { deleteLog } from "./actions";
import type { AttendanceLogRow } from "@/lib/types";

type SortColumn = "date" | "name" | null;
type SortDirection = "asc" | "desc";

export default function MonthLogsTable({ monthLogs }: { monthLogs: AttendanceLogRow[] }) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sortedLogs = useMemo(() => {
    if (!sortColumn) return monthLogs;

    return [...monthLogs].sort((a, b) => {
      let comparison = 0;
      if (sortColumn === "date") {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (isNaN(comparison)) {
            comparison = a.date.localeCompare(b.date);
        }
      } else if (sortColumn === "name") {
        const nameA = `${a.classes?.class_name || ""} ${a.classes?.student_name || ""}`;
        const nameB = `${b.classes?.class_name || ""} ${b.classes?.student_name || ""}`;
        comparison = nameA.localeCompare(nameB);
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [monthLogs, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return <ArrowUpDown className="ml-1 inline-block size-3.5 text-zinc-400" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 inline-block size-3.5 text-sky-600" />
    ) : (
      <ArrowDown className="ml-1 inline-block size-3.5 text-sky-600" />
    );
  };

  async function onDelete(row: AttendanceLogRow) {
    const fd = new FormData();
    fd.set("log_id", row.id);
    fd.set("class_id", row.class_id);
    fd.set("date", row.date);
    const res = await deleteLog(fd);
    if (res.error) {
      sonner16("Xóa ca dạy thất bại", res.error);
      return;
    }
    sonner13("Đã xóa ca dạy", "Bạn có thể điểm danh hoặc nhập lại ca này.");
  }

  return (
    <div className="clay-surface overflow-x-auto p-2 sm:p-4">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50/50">
          <tr>
            <th 
              className="cursor-pointer px-4 py-3 font-bold text-zinc-700 hover:bg-zinc-100 transition-colors select-none"
              onClick={() => handleSort("date")}
            >
              Ngày {renderSortIcon("date")}
            </th>
            <th 
              className="cursor-pointer px-4 py-3 font-bold text-zinc-700 hover:bg-zinc-100 transition-colors select-none"
              onClick={() => handleSort("name")}
            >
              Lớp / học viên {renderSortIcon("name")}
            </th>
            <th className="px-4 py-3 font-bold text-zinc-700">Giờ</th>
            <th className="px-4 py-3 font-bold text-zinc-700">Thành tiền</th>
            <th className="px-4 py-3 font-bold text-zinc-700">Trạng thái</th>
            <th className="px-4 py-3 text-right font-bold text-zinc-700">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {monthLogs.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-zinc-400 font-medium">
                Chưa có log dạy trong tháng hiện tại.
              </td>
            </tr>
          ) : (
            sortedLogs.map((row) => (
              <tr key={row.id} className="border-b border-zinc-100/50 hover:bg-zinc-50/30 transition-colors">
                <td className="px-4 py-3.5 whitespace-nowrap text-zinc-600 font-medium">{row.date}</td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-col min-w-[150px]">
                    <span className="font-bold text-zinc-900">{row.classes?.class_name}</span>
                    <span className="text-[11px] text-zinc-500 font-medium">{row.classes?.student_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-zinc-600 font-bold">{row.duration}h</td>
                <td className="px-4 py-3.5 font-black text-primary">
                  {Number(row.total_earned).toLocaleString("vi-VN")}đ
                </td>
                <td className="px-4 py-3.5">
                   <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                     row.status === 'completed' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'
                   }`}>
                     {row.status === 'completed' ? 'Xong' : 'Vắng'}
                   </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => void onDelete(row)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-danger-light/50 px-3 py-1.5 text-[11px] font-bold text-danger hover:bg-danger-light transition-colors"
                  >
                    <Trash2Icon className="size-3.5" />
                    <span>Xóa</span>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
