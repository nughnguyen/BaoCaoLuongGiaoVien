"use client";

import Link from "next/link";
import { useState } from "react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import {
  DownloadIcon,
  BookTextIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  CircleSmallIcon,
  HomeIcon,
  LayoutPanelTopIcon,
  LogOutIcon,
  MenuIcon,
  type LucideProps,
  SchoolIcon,
  UserIcon,
} from "lucide-react";
import { signOut } from "./actions";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import AccountFormPopup from "./account-form";
import type { Profile } from "@/lib/types";

type Item = {
  name: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
} & ({ type: "page"; href: string } | { type: "category"; children: Item[] });

const menu: Item[] = [
  { name: "Dashboard", icon: HomeIcon, type: "page", href: "#dashboard-top" },
  { name: "Nhắc lịch hôm nay", icon: CalendarDaysIcon, type: "page", href: "#today-reminders" },
  {
    name: "Quản lý lớp",
    icon: SchoolIcon,
    type: "category",
    children: [
      { name: "Form tạo lớp", icon: LayoutPanelTopIcon, type: "page", href: "#class-form" },
      { name: "Danh sách lớp", icon: LayoutPanelTopIcon, type: "page", href: "#class-list" },
    ],
  },
  { name: "Báo cáo tháng", icon: BookTextIcon, type: "page", href: "#month-report" },
];

function NavigationItem({
  item,
  level,
  onNavigate,
}: {
  item: Item;
  level: number;
  onNavigate?: () => void;
}) {
  if (item.type === "page") {
    return (
      <div
        className="rounded-md p-1 hover:bg-cyan-50"
        style={{ paddingLeft: `${level === 0 ? 0.25 : 1.75}rem` }}
      >
        <Link href={item.href} onClick={onNavigate} className="flex items-center gap-2 text-slate-700">
          {level === 0 ? <item.icon className="size-4 shrink-0" /> : <CircleSmallIcon className="size-4 shrink-0" />}
          <span className="text-sm">{item.name}</span>
        </Link>
      </div>
    );
  }

  return (
    <Collapsible className="flex flex-col gap-1.5" style={{ paddingLeft: `${level === 0 ? 0 : 1.5}rem` }}>
      <CollapsibleTrigger className="flex items-center gap-2 rounded-md p-1 text-slate-700">
        {level === 0 ? <item.icon className="size-4 shrink-0" /> : <CircleSmallIcon className="size-4 shrink-0" />}
        <span className="flex-1 text-left text-sm">{item.name}</span>
        <ChevronRightIcon className="size-4 shrink-0 transition-transform [[data-state=open]>&]:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-1.5 overflow-hidden">
        {item.children.map((child) => (
          <NavigationItem key={child.name} item={child} level={level + 1} onNavigate={onNavigate} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function DashboardNavigationMenu({ monthKey, profile }: { monthKey: string; profile: Profile }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <>
      <div className="fixed left-3 top-3 z-50 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Mở menu">
              <MenuIcon className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[88vw] max-w-[320px]">
            <SheetHeader>
              <SheetTitle>Điều hướng</SheetTitle>
            </SheetHeader>
            <SidebarContent monthKey={monthKey} profile={profile} onNavigate={closeMobileMenu} />
          </SheetContent>
        </Sheet>
      </div>

      <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 border-r border-cyan-100 bg-white/95 p-4 pt-6 shadow-xl lg:block">
        <p className="mb-3 text-base font-semibold text-cyan-900">Điều hướng</p>
        <SidebarContent monthKey={monthKey} profile={profile} />
      </aside>
    </>
  );
}

function SidebarContent({ monthKey, profile, onNavigate }: { monthKey: string; profile: Profile; onNavigate?: () => void }) {
  const [showAccount, setShowAccount] = useState(false);

  const handleExport = (e: React.MouseEvent) => {
    e.preventDefault();
    const defaultFilename = `Bao-cao-luong-${monthKey}`;
    const filename = window.prompt("Nhập tên file muốn lưu (không cần .xlsx):", defaultFilename);
    
    if (filename === null) return; // User cancelled
    
    const finalFilename = filename.trim() || defaultFilename;
    window.location.href = `/api/export/excel?month_key=${monthKey}&filename=${encodeURIComponent(finalFilename)}`;
    onNavigate?.();
  };

  return (
    <>
      <div className="flex flex-col gap-2.5 p-1">
        {menu.map((item) => (
          <NavigationItem key={item.name} item={item} level={0} onNavigate={onNavigate} />
        ))}
      </div>
      <div className="mt-6 border-t border-cyan-100 pt-4">
        <button
          onClick={() => {
            setShowAccount(true);
            onNavigate?.();
          }}
          className="mb-2 inline-flex w-full items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
        >
          <UserIcon className="size-4" />
          Tài khoản
        </button>
        <button
          onClick={handleExport}
          className="mb-2 inline-flex w-full items-center gap-2 rounded-xl bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-800 hover:bg-cyan-100"
        >
          <DownloadIcon className="size-4" />
          Xuất báo cáo tháng
        </button>
        <form action={signOut}>
          <button
            type="submit"
            onClick={onNavigate}
            className="inline-flex w-full items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            <LogOutIcon className="size-4" />
            Đăng xuất
          </button>
        </form>
      </div>

      <AccountFormPopup
        open={showAccount}
        onOpenChange={setShowAccount}
        profile={profile}
      />
    </>
  );
}
