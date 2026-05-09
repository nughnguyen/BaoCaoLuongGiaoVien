import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AuthForm from "./auth-form";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Tự động chuyển hướng vào dashboard nếu đã có phiên đăng nhập
  if (user) {
    redirect("/dashboard");
  }

  // Nếu chưa đăng nhập, hiển thị form Đăng nhập / Đăng ký
  return <AuthForm />;
}
