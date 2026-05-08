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
    <div className="clay-surface overflow-x-auto p-3">
      <table className="w-full min-w-[740px] text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50">
          <tr>
            <th 
              className="cursor-pointer px-3 py-2 font-medium text-zinc-700 hover:bg-zinc-100 transition-colors select-none"
              onClick={() => handleSort("date")}
            >
              Ngày {renderSortIcon("date")}
            </th>
            <th 
              className="cursor-pointer px-3 py-2 font-medium text-zinc-700 hover:bg-zinc-100 transition-colors select-none"
              onClick={() => handleSort("name")}
            >
              Lớp / học viên {renderSortIcon("name")}
            </th>
            <th className="px-3 py-2 font-medium text-zinc-700">Giờ</th>
            <th className="px-3 py-2 font-medium text-zinc-700">Thành tiền</th>
            <th className="px-3 py-2 font-medium text-zinc-700">Trạng thái</th>
            <th className="px-3 py-2 text-right font-medium text-zinc-700">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {monthLogs.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-center text-zinc-500">
                Chưa có log dạy trong tháng hiện tại.
              </td>
            </tr>
          ) : (
            sortedLogs.map((row) => (
              <tr key={row.id} className="border-b border-zinc-100">
                <td className="px-3 py-2">{row.date}</td>
                <td className="px-3 py-2">
                  {row.classes?.class_name} - {row.classes?.student_name}
                </td>
                <td className="px-3 py-2">{row.duration}</td>
                <td className="px-3 py-2 font-medium">
                  {Number(row.total_earned).toLocaleString("vi-VN")} VND
                </td>
                <td className="px-3 py-2">{row.status}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => void onDelete(row)}
                    className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                  >
                    <Trash2Icon className="size-3.5" />
                    Xóa ca
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
