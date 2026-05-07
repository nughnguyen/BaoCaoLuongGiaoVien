"use client";

import { Trash2Icon } from "lucide-react";
import { sonner13, sonner16 } from "@/lib/sonner-presets";
import { deleteLog } from "./actions";
import type { AttendanceLogRow } from "@/lib/types";

export default function MonthLogsTable({ monthLogs }: { monthLogs: AttendanceLogRow[] }) {
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
            <th className="px-3 py-2 font-medium text-zinc-700">Ngày</th>
            <th className="px-3 py-2 font-medium text-zinc-700">Lớp / học viên</th>
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
            monthLogs.map((row) => (
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
