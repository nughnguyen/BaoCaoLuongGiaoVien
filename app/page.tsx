import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <div className="max-w-lg space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Báo cáo ca dạy &amp; lương theo lớp
        </h1>
        <p className="text-zinc-600">
          Ghi nhận số giờ theo từng lớp, tính lương (giờ × đơn giá) và xuất file
          Excel. Xây dựng với Next.js App Router và Supabase (RLS).
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/login"
          className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-medium text-white shadow hover:bg-emerald-700"
        >
          Đăng nhập / Đăng ký
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
        >
          Vào bảng điều khiển
        </Link>
      </div>
      <p className="max-w-md text-xs text-zinc-500">
        Cấu hình biến môi trường Supabase trong{" "}
        <code className="rounded bg-zinc-100 px-1">code/.env.local</code> và chạy
        file migration trong{" "}
        <code className="rounded bg-zinc-100 px-1">
          supabase/migrations/
        </code>
        .
      </p>
    </div>
  );
}
