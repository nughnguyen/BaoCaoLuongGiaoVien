import { GraduationCap, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-border/50 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-accent-blue to-accent-purple flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter">GumballZ</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-bold text-muted hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Quay lại Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 pt-12 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-success-light text-success">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">Chính sách Bảo mật</h1>
        </div>

        <div className="bg-white rounded-3xl border border-border p-8 md:p-12 space-y-10 shadow-xl shadow-primary/5">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
              1. Thu thập thông tin
            </h2>
            <p className="text-muted leading-relaxed">
              GumballZ Smart Teaching Log chỉ thu thập những thông tin cần thiết để phục vụ mục đích quản lý ca dạy và tính lương của bạn:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted ml-4 font-medium">
              <li>Thông tin hồ sơ: Tên, vai trò, chi tiết ngân hàng (để xuất báo cáo).</li>
              <li>Dữ liệu giảng dạy: Tên lớp, tên học viên, lịch học, và các ca dạy đã thực hiện.</li>
              <li>Dữ liệu hệ thống: Thời gian đăng nhập và hoạt động cơ bản để bảo mật tài khoản.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
              2. Sử dụng thông tin
            </h2>
            <p className="text-muted leading-relaxed">
              Thông tin của bạn được sử dụng vào các mục đích sau:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted ml-4">
              <li>Lưu trữ lịch sử giảng dạy và tự động tính toán thu nhập hàng tháng.</li>
              <li>Xuất báo cáo lương dưới dạng file Excel chuẩn xác.</li>
              <li>Gửi thông báo nhắc nhở các ca dạy cần điểm danh.</li>
              <li>Cá nhân hóa trải nghiệm người dùng trên Dashboard.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
              3. Bảo mật dữ liệu
            </h2>
            <p className="text-muted leading-relaxed">
              Chúng tôi cam kết bảo vệ dữ liệu của bạn bằng các công nghệ hàng đầu:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted ml-4">
              <li>Dữ liệu được lưu trữ an toàn trên nền tảng Supabase với cơ chế xác thực mạnh.</li>
              <li>Mọi thông tin cá nhân đều được bảo vệ bởi chính sách RLS (Row Level Security), đảm bảo chỉ bạn mới có quyền xem và sửa dữ liệu của mình.</li>
              <li>Chúng tôi không bao giờ chia sẻ dữ liệu giảng dạy của bạn cho bên thứ ba.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
              4. Quyền của bạn
            </h2>
            <p className="text-muted leading-relaxed">
              Bạn có toàn quyền kiểm soát dữ liệu của mình trong ứng dụng:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted ml-4">
              <li>Truy cập và xem lại toàn bộ lịch sử ca dạy bất cứ lúc nào.</li>
              <li>Cập nhật hoặc chỉnh sửa thông tin cá nhân và ngân hàng.</li>
              <li>Yêu cầu xóa tài khoản và dữ liệu liên quan nếu không còn nhu cầu sử dụng.</li>
            </ul>
          </section>

          <section className="pt-8 border-t border-border">
            <p className="text-xs text-muted-light font-bold uppercase tracking-widest text-center">
              Cập nhật lần cuối: 14 tháng 05, 2026 — Phiên bản v0.2.1
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
