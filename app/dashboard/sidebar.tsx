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
  Sparkles,
  Menu,
} from "lucide-react";
import { signOut } from "./actions";
import { Button } from "@/components/ui/button";
import AccountFormPopup from "./account-form";
import type { Profile } from "@/lib/types";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type NavItem = {
  name: string;
  nameVi: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
};

const navItems: NavItem[] = [
  { name: "Dashboard", nameVi: "Tổng quan", icon: HomeIcon, href: "#dashboard-top" },
  { name: "Today Schedule", nameVi: "Lịch hôm nay", icon: CalendarDaysIcon, href: "#today-reminders" },
  { name: "Class Management", nameVi: "Quản lý lớp", icon: SchoolIcon, href: "#class-list" },
  { name: "Add Class", nameVi: "Tạo lớp mới", icon: PlusIcon, href: "#class-form" },
  { name: "Session Reports", nameVi: "Báo cáo tháng", icon: BookTextIcon, href: "#month-report" },
  { name: "Export Excel", nameVi: "Xuất Excel", icon: DownloadIcon, href: "#" },
  { name: "Account", nameVi: "Tài khoản", icon: UserIcon, href: "#" },
];

function SidebarContent({
  activeItem,
  setActiveItem,
  setAccountOpen,
  monthKey,
  profile,
  onItemClick,
}: {
  activeItem: string;
  setActiveItem: (name: string) => void;
  setAccountOpen: (open: boolean) => void;
  monthKey: string;
  profile: Profile;
  onItemClick?: () => void;
}) {
  const userName = profile?.full_name || "Giáo viên";
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-accent-blue to-accent-purple flex items-center justify-center shadow-lg shadow-primary/20">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tighter leading-none">GumballZ</h1>
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Smart Log</p>
        </div>
      </div>

      {/* User Profile */}
      <div className="px-4 py-4 mx-4 mb-6 rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-border/50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-accent-blue to-accent-purple flex items-center justify-center text-white text-xs font-black shadow-md">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground truncate">{userName}</p>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-warning" />
              <p className="text-[10px] font-bold text-muted-light uppercase tracking-wider">Teacher</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = activeItem === item.name;
          const Icon = item.icon;

          if (item.name === "Account") {
            return (
              <button
                key={item.name}
                onClick={() => {
                  setAccountOpen(true);
                  onItemClick?.();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 text-muted hover:bg-gray-50 hover:text-primary group"
              >
                <Icon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                <span>{item.nameVi}</span>
              </button>
            );
          }

          if (item.name === "Export Excel") {
            return (
              <a
                key={item.name}
                href={`/api/export/excel?month_key=${monthKey}`}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 text-muted hover:bg-gray-50 hover:text-primary group"
              >
                <Icon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                <span>{item.nameVi}</span>
              </a>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => {
                setActiveItem(item.name);
                onItemClick?.();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "text-muted hover:bg-gray-50 hover:text-primary group"
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 transition-transform ${isActive ? "" : "group-hover:scale-110"}`} />
              <span>{item.nameVi}</span>
            </Link>
          );
        })}
      </nav>

      {/* CTA Button */}
      <div className="px-4 pb-6 mt-4">
        <Link href="#class-form" className="block" onClick={() => onItemClick?.()}>
          <Button className="w-full h-12 gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent-blue hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 font-bold">
            <PlusIcon className="w-5 h-5" />
            Tạo lớp mới
          </Button>
        </Link>
      </div>

      {/* Logout */}
      <div className="px-4 pb-6">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-muted hover:bg-danger-light hover:text-danger transition-all duration-300 group"
        >
          <LogOutIcon className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({
  monthKey,
  profile,
}: {
  monthKey: string;
  profile: Profile;
}) {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <>
      <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-sidebar-bg border-r border-border/50 z-40 hidden lg:flex flex-col shadow-2xl shadow-primary/5">
        <SidebarContent
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          setAccountOpen={setAccountOpen}
          monthKey={monthKey}
          profile={profile}
        />
      </aside>

      <AccountFormPopup
        open={accountOpen}
        onOpenChange={setAccountOpen}
        profile={profile}
      />
    </>
  );
}

export function MobileSidebar({
  monthKey,
  profile,
}: {
  monthKey: string;
  profile: Profile;
}) {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [accountOpen, setAccountOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Menu className="w-6 h-6 text-foreground" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px] border-none bg-sidebar-bg">
          <SidebarContent
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            setAccountOpen={setAccountOpen}
            monthKey={monthKey}
            profile={profile}
            onItemClick={() => setIsOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <AccountFormPopup
        open={accountOpen}
        onOpenChange={setAccountOpen}
        profile={profile}
      />
    </>
  );
}
