-- Add start_time and end_time to attendance_logs
alter table public.attendance_logs
add column if not exists start_time text,
add column if not exists end_time text;
