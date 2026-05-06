"use client";

import { loginWithPassword, registerWithPassword } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

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
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-16">
      <div className="clay-card p-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Báo cáo ca dạy
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Đăng nhập hoặc tạo tài khoản giáo viên.
        </p>
      </div>

      <div className="clay-inset flex p-1 text-sm">
        <button
          type="button"
          className={`flex-1 rounded-2xl py-2 ${mode === "login" ? "bg-white/80 shadow-sm" : ""}`}
          onClick={() => setMode("login")}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          className={`flex-1 rounded-2xl py-2 ${mode === "register" ? "bg-white/80 shadow-sm" : ""}`}
          onClick={() => setMode("register")}
        >
          Đăng ký
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "register" && (
          <label className="flex flex-col gap-1 text-sm">
            Họ tên
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
          </label>
        )}
        <label className="flex flex-col gap-1 text-sm">
          Email
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Mật khẩu
          <Input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={
              mode === "register" ? "new-password" : "current-password"
            }
          />
        </label>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? "Đang xử lý…" : mode === "login" ? "Đăng nhập" : "Đăng ký"}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        <Link href="/" className="text-cyan-700 hover:underline">
          ← Về trang chủ
        </Link>
      </p>
    </div>
  );
}
