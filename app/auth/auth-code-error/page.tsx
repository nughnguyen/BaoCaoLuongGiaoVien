import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-4 px-4">
      <h1 className="text-xl font-semibold">Đăng nhập thất bại</h1>
      <p className="text-sm text-zinc-600">
        Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng thử đăng nhập lại.
      </p>
      <Link
        href="/login"
        className="rounded-md bg-emerald-600 px-4 py-2 text-center text-sm text-white hover:bg-emerald-700"
      >
        Về trang đăng nhập
      </Link>
    </div>
  );
}
