"use client";

import { loginWithPassword, registerWithPassword } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginPage() {
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Brand header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-lg mb-4">
            <span className="text-white text-2xl font-bold">B</span>
          </div>
          <h1 className="text-2xl font-bold text-cyan-950 tracking-tight">Báo Cáo Ca Dạy</h1>
          <p className="text-sm text-slate-500 mt-1">Hệ thống quản lý lịch dạy & lương giáo viên</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            {/* Tab switcher */}
            <div className="flex rounded-xl clay-inset p-1 text-sm mb-1">
              <button
                type="button"
                onClick={() => { setMode("login"); setError(null); }}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                  mode === "login"
                    ? "bg-white/90 text-cyan-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => { setMode("register"); setError(null); }}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                  mode === "register"
                    ? "bg-white/90 text-cyan-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Đăng ký
              </button>
            </div>

            <CardTitle className="text-lg">
              {mode === "login" ? "Chào mừng trở lại!" : "Tạo tài khoản mới"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Nhập email và mật khẩu để tiếp tục"
                : "Điền thông tin để tạo tài khoản giáo viên"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form id="auth-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === "register" && (
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Họ và tên</Label>
                  <Input
                    id="fullName"
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="giaovien@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Mật khẩu</Label>
                  {mode === "login" && (
                    <a
                      href="#"
                      className="ml-auto text-xs text-cyan-600 hover:underline underline-offset-4"
                    >
                      Quên mật khẩu?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder={mode === "register" ? "Tối thiểu 6 ký tự" : "••••••••"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === "register" ? "new-password" : "current-password"}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {mode === "login" && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal cursor-pointer text-slate-600">
                    Lưu đăng nhập
                  </Label>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2" role="alert">
                  {error}
                </p>
              )}
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              form="auth-form"
              disabled={loading}
              className="w-full rounded-xl"
            >
              {loading ? "Đang xử lý…" : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
            </Button>

            <p className="text-center text-xs text-slate-400">
              {mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
              <button
                type="button"
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); }}
                className="text-cyan-600 font-medium hover:underline underline-offset-4"
              >
                {mode === "login" ? "Đăng ký ngay" : "Đăng nhập"}
              </button>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-slate-400">
          <Link href="/" className="text-cyan-600 hover:underline">
            ← Về trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}
