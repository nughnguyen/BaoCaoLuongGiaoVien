export type Profile = {
  id: string;
  full_name: string | null;
  role: "admin" | "teacher";
  bank_name?: string;
  bank_account_name?: string;
  bank_account_number?: string;
};

export type ScheduleDetail = {
  day: number;
  start_time: string;
  end_time: string;
  duration: number;
};

export type ClassRow = {
  id: string;
  class_name: string;
  student_name: string;
  hourly_rate: number;
  schedule: number[];
  schedule_details: ScheduleDetail[];
  program_details: string | null;
  teacher_name: string;
  student_count: number;
  branch_name: string;
};

export type AttendanceLogRow = {
  id: string;
  class_id: string;
  date: string;
  duration: number;
  total_earned: number;
  month_key: string;
  status: "completed" | "absent";
  classes: { class_name: string; student_name: string } | null;
};
