"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { AttendanceLogRow } from "@/lib/types";

export default function EarningsChart({ monthLogs }: { monthLogs: AttendanceLogRow[] }) {
  const chartData = useMemo(() => {
    const dailyMap = new Map<string, { sessions: number; earnings: number }>();

    for (const log of monthLogs) {
      const date = log.date;
      const existing = dailyMap.get(date) || { sessions: 0, earnings: 0 };
      existing.sessions += 1;
      existing.earnings += Number(log.total_earned);
      dailyMap.set(date, existing);
    }

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
        sessions: data.sessions,
        earnings: data.earnings,
      }))
      .reverse();
  }, [monthLogs]);

  if (chartData.length === 0) {
    return (
      <div className="bg-card-bg rounded-2xl border border-border shadow-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Lịch dạy & Thu nhập</h3>
        <div className="h-[200px] flex items-center justify-center text-muted text-sm">
          Chưa có dữ liệu tháng này
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card-bg rounded-2xl border border-border shadow-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-foreground">Lịch dạy & Thu nhập</h3>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
            Số ca
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
            Thu nhập
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2E5BFF" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2E5BFF" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "white",
              border: "1px solid #E5E7EB",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              fontSize: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="sessions"
            stroke="#2E5BFF"
            strokeWidth={2}
            fill="url(#colorSessions)"
            name="Số ca"
          />
          <Area
            type="monotone"
            dataKey="earnings"
            stroke="#059669"
            strokeWidth={2}
            fill="url(#colorEarnings)"
            name="Thu nhập (đ)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
