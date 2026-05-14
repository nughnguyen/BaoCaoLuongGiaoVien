import { GraduationCap, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
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
          <div className="p-3 rounded-2xl bg-primary-light text-primary">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">Điều khoản Dịch vụ</h1>
        </div>

        <div className="bg-white rounded-3xl border border-border p-8 md:p-12 space-y-10 shadow-xl shadow-primary/5">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
              1. Chấp nhận điều khoản
            </h2>
            <p className="text-muted leading-relaxed">
              Bằng việc đăng ký tài khoản và sử dụng GumballZ Smart Teaching Log, bạn đồng ý tuân thủ các điều khoản này. Nếu bạn không đồng ý với bất kỳ phần nào của điều khoản, vui lòng ngừng sử dụng dịch vụ.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
              2. Trách nhiệm người dùng
            </h2>
            <p className="text-muted leading-relaxed">
              Người dùng có trách nhiệm đảm bảo tính chính xác của dữ liệu nhập vào:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted ml-4">
              <li>Cung cấp đúng tên lớp, tên học viên và thời gian giảng dạy.</li>
              <li>Tự quản lý tài khoản và mật khẩu của mình một cách bảo mật.</li>
              <li>Chỉ sử dụng ứng dụng cho mục đích cá nhân trong việc quản lý giảng dạy.</li>
              <li>Không sử dụng ứng dụng cho các hoạt động gian lận hoặc vi phạm pháp luật.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
              3. Quyền sở hữu và Bản quyền
            </h2>
            <p className="text-muted leading-relaxed">
              Toàn bộ giao diện, mã nguồn, và nội dung hệ thống GumballZ đều thuộc sở hữu của GumballZ Team. Dữ liệu giảng dạy và thông tin cá nhân do người dùng nhập vào thuộc quyền sở hữu của chính người dùng đó.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
              4. Giới hạn trách nhiệm
            </h2>
            <p className="text-muted leading-relaxed">
              GumballZ cung cấp công cụ hỗ trợ tính toán lương và quản lý ca dạy dựa trên dữ liệu người dùng cung cấp. Chúng tôi không chịu trách nhiệm đối với các sai sót phát sinh từ việc nhập sai dữ liệu hoặc các tranh chấp về lương giữa người dùng và đơn vị công tác.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
              5. Thay đổi điều khoản
            </h2>
            <p className="text-muted leading-relaxed">
              Chúng tôi có quyền cập nhật các điều khoản này để phù hợp với sự phát triển của ứng dụng. Mọi thay đổi lớn sẽ được thông báo trực tiếp đến người dùng qua hệ thống hoặc email.
            </p>
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
