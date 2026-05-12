"use client";

import { GraduationCap, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-12 py-10 border-t border-border bg-white/50 backdrop-blur-sm rounded-3xl mb-6 mx-2">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3 group cursor-default">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-accent-blue to-accent-purple flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors duration-300">
                  GumballZ
                  <span className="inline-block w-2 h-2 rounded-full bg-accent-pink ml-1 animate-pulse" />
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-light font-bold">
                  Smart Teaching Log
                </span>
              </div>
            </div>
            <p className="text-sm text-muted max-w-xs text-center md:text-left leading-relaxed">
              Giải pháp quản lý giảng dạy thông minh, tối ưu hóa quy trình báo cáo và theo dõi thu nhập.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3">
            <div className="flex items-center gap-6 text-sm font-medium text-muted">
              <a href="#" className="hover:text-primary transition-colors">Tính năng</a>
              <a href="#" className="hover:text-primary transition-colors">Hướng dẫn</a>
              <a href="#" className="hover:text-primary transition-colors">Hỗ trợ</a>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-light mt-2">
              <span>Phiên bản v2.4.1</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5">
                <span>Made with</span>
                <Heart className="w-3 h-3 text-danger animate-bounce" />
                <span>by GumballZ Team</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-muted-light font-medium uppercase tracking-wider">
          <p>© 2026 GumballZ. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
