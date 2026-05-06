-- Hệ thống ca dạy + lương theo lớp. Chạy trên Supabase SQL editor hoặc: supabase db push (khi đã link project).

-- Profiles (role trong DB, không dùng user_metadata cho RLS nghiêm ngặt)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'teacher' check (role in ('admin', 'teacher')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own_or_admin"
on public.profiles for select to authenticated
using (
  id = (select auth.uid())
  or exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  )
);

create policy "profiles_update_own"
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- Tạo profile khi đăng ký
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'teacher'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Lớp học + mức lương theo giờ
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  hourly_rate numeric(12, 2) not null check (hourly_rate >= 0),
  created_at timestamptz not null default now()
);

alter table public.classes enable row level security;

create policy "classes_select_authenticated"
on public.classes for select to authenticated
using (true);

create policy "classes_insert_admin"
on public.classes for insert to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  )
);

create policy "classes_update_admin"
on public.classes for update to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  )
);

create policy "classes_delete_admin"
on public.classes for delete to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  )
);

-- Ca dạy
create table public.teaching_sessions (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete restrict,
  session_date date not null,
  hours numeric(7, 2) not null check (hours > 0),
  note text,
  created_at timestamptz not null default now()
);

create index teaching_sessions_teacher_date_idx
  on public.teaching_sessions (teacher_id, session_date desc);

alter table public.teaching_sessions enable row level security;

create policy "sessions_select_own_or_admin"
on public.teaching_sessions for select to authenticated
using (
  teacher_id = (select auth.uid())
  or exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  )
);

create policy "sessions_insert_own_or_admin"
on public.teaching_sessions for insert to authenticated
with check (
  teacher_id = (select auth.uid())
  or exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  )
);

create policy "sessions_update_own_or_admin"
on public.teaching_sessions for update to authenticated
using (
  teacher_id = (select auth.uid())
  or exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  )
)
with check (
  teacher_id = (select auth.uid())
  or exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  )
);

create policy "sessions_delete_own_or_admin"
on public.teaching_sessions for delete to authenticated
using (
  teacher_id = (select auth.uid())
  or exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  )
);
