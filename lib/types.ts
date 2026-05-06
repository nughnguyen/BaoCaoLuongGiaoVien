export type Profile = {
  id: string;
  full_name: string | null;
  role: "admin" | "teacher";
};

export type ClassRow = {
  id: string;
  class_name: string;
  student_name: string;
  hourly_rate: number;
  schedule: number[];
  program_details: string | null;
  teacher_name: string;
};

export type AttendanceLogRow = {
  id: string;
  class_id: string;
  date: string;
  duration: number;
  total_earned: number;
  month_key: string;
  status: "completed";
  classes: { class_name: string; student_name: string } | null;
};
