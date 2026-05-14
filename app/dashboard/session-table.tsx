"use client";

import { useState, useMemo } from "react";
import { Trash2Icon, SearchIcon, ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { sonner13, sonner16 } from "@/lib/sonner-presets";
import { deleteLog } from "./actions";
import { Badge } from "@/components/ui/badge";
import type { AttendanceLogRow } from "@/lib/types";

type SortColumn = "date" | "name" | null;
type SortDirection = "asc" | "desc";

export default function SessionTable({ monthLogs }: { monthLogs: AttendanceLogRow[] }) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAndSortedLogs = useMemo(() => {
    let result = monthLogs;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((log) => {
        const name = `${log.classes?.class_name || ""} ${log.classes?.student_name || ""}`.toLowerCase();
        return name.includes(q) || log.date.includes(q);
      });
    }

    if (!sortColumn) return result;

    return [...result].sort((a, b) => {
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
  }, [monthLogs, sortColumn, sortDirection, searchQuery]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column)
      return <ArrowUpDown className="ml-1 inline-block size-3 text-gray-400" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 inline-block size-3 text-primary" />
    ) : (
      <ArrowDown className="ml-1 inline-block size-3 text-primary" />
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
    <div className="bg-card-bg rounded-2xl border border-border shadow-card overflow-hidden">
      {/* Search bar */}
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light" />
          <input
            type="text"
            placeholder="Tìm kiếm lớp, học viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-gray-50 focus:bg-white focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <span className="text-xs text-muted">
          {filteredAndSortedLogs.length} ca dạy
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-gray-50/50">
              <th
                className="cursor-pointer px-4 lg:px-5 py-3 text-left font-medium text-muted hover:text-foreground transition-colors select-none"
                onClick={() => handleSort("date")}
              >
                Ngày {renderSortIcon("date")}
              </th>
              <th
                className="cursor-pointer px-4 lg:px-5 py-3 text-left font-medium text-muted hover:text-foreground transition-colors select-none"
                onClick={() => handleSort("name")}
              >
                Lớp / Học viên {renderSortIcon("name")}
              </th>
              <th className="hidden sm:table-cell px-5 py-3 text-left font-medium text-muted">Giờ</th>
              <th className="px-4 lg:px-5 py-3 text-left font-medium text-muted">Thành tiền</th>
              <th className="hidden sm:table-cell px-5 py-3 text-left font-medium text-muted">Trạng thái</th>
              <th className="px-4 lg:px-5 py-3 text-right font-medium text-muted">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-muted">
                  {searchQuery ? "Không tìm thấy kết quả" : "Chưa có ca dạy nào trong tháng này"}
                </td>
              </tr>
            ) : (
              filteredAndSortedLogs.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 lg:px-5 py-3.5 whitespace-nowrap">
                    {new Date(row.date).toLocaleDateString("vi-VN", {
                      weekday: "short",
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </td>
                  <td className="px-4 lg:px-5 py-3.5">
                    <div className="min-w-[120px]">
                      <p className="font-medium text-foreground truncate">
                        {row.classes?.class_name || "—"}
                      </p>
                      <p className="text-xs text-muted truncate">{row.classes?.student_name}</p>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-5 py-3.5 whitespace-nowrap">{row.duration}h</td>
                  <td className="px-4 lg:px-5 py-3.5 whitespace-nowrap font-bold text-success">
                    {Number(row.total_earned).toLocaleString("vi-VN")}đ
                  </td>
                  <td className="hidden sm:table-cell px-5 py-3.5">
                    <Badge variant={row.status === "completed" ? "success" : "danger"}>
                      {row.status === "completed" ? "Hoàn thành" : "Vắng"}
                    </Badge>
                  </td>
                  <td className="px-4 lg:px-5 py-3.5 text-right">
                    <button
                      onClick={() => onDelete(row)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-danger hover:bg-danger-light transition-colors"
                    >
                      <Trash2Icon className="size-3.5" />
                      <span className="hidden xs:inline">Xóa</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
