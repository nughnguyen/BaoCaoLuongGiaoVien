"use client";

import { DollarSign, Clock, CheckCircle2, TrendingUp } from "lucide-react";

type StatsCardsProps = {
  totalSalary: number;
  totalHours: number;
  completedSessions: number;
};

export default function StatsCards({ totalSalary, totalHours, completedSessions }: StatsCardsProps) {
  const stats = [
    {
      label: "Tổng lương tháng",
      value: `${totalSalary.toLocaleString("vi-VN")}đ`,
      icon: DollarSign,
      highlighted: true,
      trend: null,
    },
    {
      label: "Tổng giờ dạy",
      value: `${totalHours.toFixed(1)}h`,
      icon: Clock,
      highlighted: false,
      trend: null,
    },
    {
      label: "Ca đã hoàn thành",
      value: completedSessions.toString(),
      icon: CheckCircle2,
      highlighted: false,
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className={`rounded-2xl p-5 transition-all duration-200 hover:shadow-card-hover ${
              stat.highlighted
                ? "bg-gradient-to-br from-primary to-blue-500 text-white shadow-lg shadow-primary/20"
                : "bg-card-bg border border-border shadow-card"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-xs font-medium mb-2 ${stat.highlighted ? "text-blue-100" : "text-muted"}`}>
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold tracking-tight ${stat.highlighted ? "text-white" : "text-foreground"}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                stat.highlighted
                  ? "bg-white/20"
                  : "bg-primary-light"
              }`}>
                <Icon className={`w-5 h-5 ${stat.highlighted ? "text-white" : "text-primary"}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
