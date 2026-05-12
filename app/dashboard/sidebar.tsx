"use client";

import Link from "next/link";
import { useState } from "react";
import {
  HomeIcon,
  CalendarDaysIcon,
  SchoolIcon,
  BookTextIcon,
  DownloadIcon,
  UserIcon,
  PlusIcon,
  LogOutIcon,
  GraduationCap,
} from "lucide-react";
import { signOut } from "./actions";
import { Button } from "@/components/ui/button";
import AccountFormPopup from "./account-form";
import type { Profile } from "@/lib/types";

type NavItem = {
  name: string;
  nameVi: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
};

const navItems: NavItem[] = [
  { name: "Dashboard", nameVi: "Tổng quan", icon: HomeIcon, href: "#dashboard-top" },
  { name: "Today Schedule", nameVi: "Lịch hôm nay", icon: CalendarDaysIcon, href: "#today-reminders" },
  { name: "Class Management", nameVi: "Quản lý lớp", icon: SchoolIcon, href: "#class-form" },
  { name: "Session Reports", nameVi: "Báo cáo tháng", icon: BookTextIcon, href: "#month-report" },
  { name: "Export Excel", nameVi: "Xuất Excel", icon: DownloadIcon, href: "#" },
  { name: "Account", nameVi: "Tài khoản", icon: UserIcon, href: "#" },
];

export default function Sidebar({
  monthKey,
  profile,
}: {
  monthKey: string;
  profile: Profile;
}) {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [accountOpen, setAccountOpen] = useState(false);

  const userName = profile?.full_name || "Giáo viên";
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-sidebar-bg border-r border-border z-40 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 flex items-center gap-3 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-sm">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground tracking-tight">TeachTrack</h1>
            <p className="text-[10px] text-muted-light">Teaching Manager</p>
          </div>
        </div>

        {/* User Profile */}
        <div className="px-4 py-4 mx-3 mt-3 rounded-xl bg-primary-light/50 border border-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
              <p className="text-[11px] text-muted">Teacher</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = activeItem === item.name;
            const Icon = item.icon;

            if (item.name === "Account") {
              return (
                <button
                  key={item.name}
                  onClick={() => setAccountOpen(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-muted hover:bg-primary-light/40 hover:text-foreground"
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span>{item.nameVi}</span>
                </button>
              );
            }

            if (item.name === "Export Excel") {
              return (
                <a
                  key={item.name}
                  href={`/api/export/excel?month_key=${monthKey}`}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-muted hover:bg-primary-light/40 hover:text-foreground"
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span>{item.nameVi}</span>
                </a>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setActiveItem(item.name)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-primary-light text-primary font-semibold shadow-sm"
                    : "text-muted hover:bg-primary-light/40 hover:text-foreground"
                }`}
              >
                <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-primary" : ""}`} />
                <span>{item.nameVi}</span>
              </Link>
            );
          })}
        </nav>

        {/* CTA Button */}
        <div className="px-4 pb-5">
          <Link href="#class-form" className="block">
            <Button className="w-full gap-2 rounded-xl">
              <PlusIcon className="w-4 h-4" />
              Tạo lớp mới
            </Button>
          </Link>
        </div>

        {/* Logout */}
        <div className="px-4 pb-4">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:bg-danger-light hover:text-danger transition-all duration-200"
          >
            <LogOutIcon className="w-[18px] h-[18px] shrink-0" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <AccountFormPopup
        open={accountOpen}
        onOpenChange={setAccountOpen}
        profile={profile}
      />
    </>
  );
}
