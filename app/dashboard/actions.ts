"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ActionResult = { error: string | null };

function parseDuration(value: FormDataEntryValue | null): number {
  if (typeof value !== "string") return Number.NaN;
  return parseFloat(value.replace(",", "."));
}

function monthKey(date: Date): string {
  return `${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
}

export async function createClass(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Chưa đăng nhập." };

  const className = String(formData.get("class_name") ?? "").trim();
  const studentName = String(formData.get("student_name") ?? "").trim();
  const teacherName = String(formData.get("teacher_name") ?? "").trim();
  const schedule = formData
    .getAll("schedule")
    .map((v) => Number(v))
    .filter((v) => Number.isInteger(v) && v >= 0 && v <= 6);
  const hourlyRate = parseDuration(formData.get("hourly_rate"));
  const studentCount = Number(formData.get("student_count") ?? 1);
  const branchName = String(formData.get("branch_name") ?? "Cơ bản").trim();
  
  let scheduleDetails = [];
  try {
    scheduleDetails = JSON.parse(String(formData.get("schedule_details") || "[]"));
  } catch {
    // ignore
  }

  if (!className || !studentName || !teacherName || !Number.isFinite(hourlyRate) || schedule.length === 0 || !branchName) {
    return { error: "Thiếu thông tin lớp, lịch học, học viên, giáo viên, chi nhánh hoặc mức lương/giờ." };
  }

  const { error } = await supabase.from("classes").insert({
    user_id: user.id,
    class_name: className,
    student_name: studentName,
    hourly_rate: hourlyRate,
    schedule,
    schedule_details: scheduleDetails,
    teacher_name: teacherName,
    student_count: studentCount,
    branch_name: branchName,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { error: null };
}

async function confirmCheckin(classId: string, status: "present" | "absent", duration: number, dateIso: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Chưa đăng nhập." };

  const { data: existing } = await supabase
    .from("daily_checkins")
    .select("id")
    .eq("user_id", user.id)
    .eq("class_id", classId)
    .eq("date", dateIso)
    .maybeSingle();

  if (existing) return { error: "Lớp này đã được điểm danh trong ngày này." };

  const { data: classRow, error: classErr } = await supabase
    .from("classes")
    .select("hourly_rate")
    .eq("id", classId)
    .eq("user_id", user.id)
    .single();
  if (classErr) return { error: classErr.message };

  const { error: checkinError } = await supabase.from("daily_checkins").insert({
    user_id: user.id,
    class_id: classId,
    date: dateIso,
    status,
  });
  if (checkinError) return { error: checkinError.message };

  if (status === "present") {
    const totalEarned = Number(classRow.hourly_rate) * duration;
    const logDate = new Date(dateIso);
    const { error: logError } = await supabase.from("attendance_logs").insert({
      user_id: user.id,
      class_id: classId,
      date: dateIso,
      duration,
      total_earned: totalEarned,
      month_key: monthKey(logDate),
      status: "completed",
    });
    if (logError) return { error: logError.message };
  }

  revalidatePath("/dashboard");
  return { error: null };
}

export async function markClassCompleted(formData: FormData): Promise<ActionResult> {
  const classId = String(formData.get("class_id") ?? "");
  const duration = parseDuration(formData.get("duration"));
  const dateIso = String(formData.get("date") ?? new Date().toISOString().slice(0, 10));
  if (!classId || !Number.isFinite(duration) || duration <= 0) {
    return { error: "Duration không hợp lệ." };
  }
  return confirmCheckin(classId, "present", duration, dateIso);
}

export async function markClassAbsent(formData: FormData): Promise<ActionResult> {
  const classId = String(formData.get("class_id") ?? "");
  const dateIso = String(formData.get("date") ?? new Date().toISOString().slice(0, 10));
  if (!classId) return { error: "Thiếu class_id." };
  return confirmCheckin(classId, "absent", 0, dateIso);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function updateClass(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Chưa đăng nhập." };

  const id = String(formData.get("id") ?? "");
  const className = String(formData.get("class_name") ?? "").trim();
  const studentName = String(formData.get("student_name") ?? "").trim();
  const teacherName = String(formData.get("teacher_name") ?? "").trim();
  const schedule = formData
    .getAll("schedule")
    .map((v) => Number(v))
    .filter((v) => Number.isInteger(v) && v >= 0 && v <= 6);
  const hourlyRate = parseDuration(formData.get("hourly_rate"));
  const studentCount = Number(formData.get("student_count") ?? 1);
  const branchName = String(formData.get("branch_name") ?? "Cơ bản").trim();

  let scheduleDetails = [];
  try {
    scheduleDetails = JSON.parse(String(formData.get("schedule_details") || "[]"));
  } catch {
    // ignore
  }

  if (!id || !className || !studentName || !teacherName || !Number.isFinite(hourlyRate) || schedule.length === 0 || !branchName) {
    return { error: "Thiếu thông tin cần cập nhật." };
  }

  const { error } = await supabase
    .from("classes")
    .update({
      class_name: className,
      student_name: studentName,
      hourly_rate: hourlyRate,
      schedule,
      schedule_details: scheduleDetails,
      teacher_name: teacherName,
      student_count: studentCount,
      branch_name: branchName,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { error: null };
}

export async function addManualLog(formData: FormData): Promise<ActionResult> {
  const classId = String(formData.get("class_id") ?? "");
  const dateStr = String(formData.get("date") ?? "");
  const duration = parseDuration(formData.get("duration"));

  if (!classId || !dateStr || !Number.isFinite(duration) || duration <= 0) {
    return { error: "Thông tin ca dạy thủ công không hợp lệ." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Chưa đăng nhập." };

  const { data: classRow, error: classErr } = await supabase
    .from("classes")
    .select("hourly_rate")
    .eq("id", classId)
    .eq("user_id", user.id)
    .single();
  
  if (classErr || !classRow) return { error: "Không tìm thấy lớp học." };

  // Check if checkin already exists
  const { data: existing } = await supabase
    .from("daily_checkins")
    .select("id")
    .eq("user_id", user.id)
    .eq("class_id", classId)
    .eq("date", dateStr)
    .maybeSingle();

  if (existing) return { error: "Ngày này đã có điểm danh trên hệ thống." };

  // Insert daily checkin
  const { error: checkinError } = await supabase.from("daily_checkins").insert({
    user_id: user.id,
    class_id: classId,
    date: dateStr,
    status: "present",
  });

  if (checkinError) return { error: checkinError.message };

  // Insert attendance log
  const logDate = new Date(dateStr);
  const totalEarned = Number(classRow.hourly_rate) * duration;
  const { error: logError } = await supabase.from("attendance_logs").insert({
    user_id: user.id,
    class_id: classId,
    date: dateStr,
    duration,
    total_earned: totalEarned,
    month_key: monthKey(logDate),
    status: "completed",
  });

  if (logError) return { error: logError.message };

  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteLog(formData: FormData): Promise<ActionResult> {
  const logId = String(formData.get("log_id") ?? "");
  const classId = String(formData.get("class_id") ?? "");
  const date = String(formData.get("date") ?? "");

  if (!logId || !classId || !date) {
    return { error: "Thiếu thông tin ca dạy cần xóa." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Chưa đăng nhập." };

  const { error: logError } = await supabase
    .from("attendance_logs")
    .delete()
    .eq("id", logId)
    .eq("user_id", user.id);

  if (logError) {
    return { error: logError.message };
  }

  const { error: checkinError } = await supabase
    .from("daily_checkins")
    .delete()
    .eq("user_id", user.id)
    .eq("class_id", classId)
    .eq("date", date);

  if (checkinError) {
    return { error: checkinError.message };
  }

  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const bankName = String(formData.get("bank_name") ?? "").trim();
  const bankAccountName = String(formData.get("bank_account_name") ?? "").trim();
  const bankAccountNumber = String(formData.get("bank_account_number") ?? "").trim();

  if (!fullName) return { error: "Họ và tên không được để trống." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Chưa đăng nhập." };

  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName }
  });

  if (error) return { error: error.message };

  // Use upsert to ensure the profile row exists
  const { error: pError } = await supabase
    .from("profiles")
    .upsert({ 
      id: user.id,
      full_name: fullName,
      bank_name: bankName,
      bank_account_name: bankAccountName,
      bank_account_number: bankAccountNumber,
    });

  if (pError) return { error: pError.message };

  revalidatePath("/dashboard", "layout");
  return { error: null };
}
