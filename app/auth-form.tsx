"use client";

import { loginWithPassword, registerWithPassword } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("savedLoginEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "login") {
      if (rememberMe) {
        localStorage.setItem("savedLoginEmail", email);
      } else {
        localStorage.removeItem("savedLoginEmail");
      }
    }

    const payload = new FormData();
    payload.set("email", email);
    payload.set("password", password);
    payload.set("fullName", fullName);

    const result =
      mode === "register"
        ? await registerWithPassword(payload)
        : await loginWithPassword(payload);

    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-[400px]">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20 mb-4">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">TeachTrack</h1>
          <p className="text-sm text-muted mt-1">Quản lý lịch dạy & lương giáo viên</p>
        </div>

        {/* Card */}
        <div className="bg-card-bg rounded-2xl border border-border shadow-card p-6">
          {/* Tab Switcher */}
          <div className="flex bg-primary-light/50 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(null); }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                mode === "login"
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(null); }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                mode === "register"
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Đăng ký
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <Label className="text-xs font-medium text-muted mb-1.5 block">Họ và tên</Label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-primary-light/30 focus:bg-white focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            )}

            <div>
              <Label className="text-xs font-medium text-muted mb-1.5 block">Email</Label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-primary-light/30 focus:bg-white focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-muted mb-1.5 block">Mật khẩu</Label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-primary-light/30 focus:bg-white focus:border-primary focus:outline-none transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === "login" && (
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-xs text-muted">Ghi nhớ đăng nhập</span>
              </label>
            )}

            {error && (
              <div className="bg-danger-light border border-danger/20 rounded-xl p-3 text-sm text-danger">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading
                ? "Đang xử lý..."
                : mode === "login"
                ? "Đăng nhập"
                : "Tạo tài khoản"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-light mt-6">
          Báo cáo ca dạy & lương giáo viên
        </p>
      </div>
    </div>
  );
}
