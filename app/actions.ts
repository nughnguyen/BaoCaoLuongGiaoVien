"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type AuthResult = { error: string | null };

function normalizeError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("fetch")) {
      return "Không kết nối được Supabase. Kiểm tra NEXT_PUBLIC_SUPABASE_URL, API key, mạng và thử lại.";
    }
    return error.message;
  }
  return "Có lỗi chưa xác định khi kết nối Supabase.";
}

export async function loginWithPassword(formData: FormData): Promise<AuthResult> {
  try {
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
  } catch (error) {
    return { error: normalizeError(error) };
  }

  redirect("/dashboard");
}

export async function registerWithPassword(formData: FormData): Promise<AuthResult> {
  try {
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const fullName = String(formData.get("fullName") ?? "").trim();
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) return { error: error.message };
  } catch (error) {
    return { error: normalizeError(error) };
  }

  redirect("/dashboard");
}
