-- Smart Teaching Log schema refresh

drop table if exists public.teaching_sessions cascade;
drop table if exists public.daily_checkins cascade;
drop table if exists public.attendance_logs cascade;

alter table if exists public.classes
  drop column if exists name,
  add column if not exists user_id uuid references auth.users (id) on delete cascade,
  add column if not exists class_name text,
  add column if not exists student_name text,
  alter column hourly_rate type numeric(12,2) using hourly_rate::numeric,
  add column if not exists schedule integer[] default '{}'::integer[],
  add column if not exists program_details text;

update public.classes set class_name = coalesce(class_name, 'Lớp chưa đặt tên') where class_name is null;
update public.classes set student_name = coalesce(student_name, 'Học viên') where student_name is null;
update public.classes set user_id = coalesce(user_id, (select auth.uid())) where user_id is null;

alter table public.classes
  alter column user_id set not null,
  alter column class_name set not null,
  alter column student_name set not null,
  alter column schedule set not null;

create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  date date not null,
  status text not null check (status in ('present','absent')),
  created_at timestamptz not null default now(),
  unique(user_id, class_id, date)
);

create table if not exists public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  date date not null,
  duration numeric(6,2) not null check (duration > 0),
  total_earned numeric(12,2) not null check (total_earned >= 0),
  month_key text not null,
  status text not null default 'completed' check (status in ('completed')),
  created_at timestamptz not null default now()
);

create index if not exists attendance_logs_user_month_idx on public.attendance_logs (user_id, month_key);
create index if not exists daily_checkins_user_date_idx on public.daily_checkins (user_id, date);

alter table public.classes enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.attendance_logs enable row level security;

drop policy if exists "classes_select_authenticated" on public.classes;
drop policy if exists "classes_insert_admin" on public.classes;
drop policy if exists "classes_update_admin" on public.classes;
drop policy if exists "classes_delete_admin" on public.classes;

create policy "classes_select_own" on public.classes
for select to authenticated
using (user_id = (select auth.uid()));

create policy "classes_insert_own" on public.classes
for insert to authenticated
with check (user_id = (select auth.uid()));

create policy "classes_update_own" on public.classes
for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "classes_delete_own" on public.classes
for delete to authenticated
using (user_id = (select auth.uid()));

create policy "daily_checkins_select_own" on public.daily_checkins
for select to authenticated
using (user_id = (select auth.uid()));

create policy "daily_checkins_insert_own" on public.daily_checkins
for insert to authenticated
with check (user_id = (select auth.uid()));

create policy "attendance_logs_select_own" on public.attendance_logs
for select to authenticated
using (user_id = (select auth.uid()));

create policy "attendance_logs_insert_own" on public.attendance_logs
for insert to authenticated
with check (user_id = (select auth.uid()));
