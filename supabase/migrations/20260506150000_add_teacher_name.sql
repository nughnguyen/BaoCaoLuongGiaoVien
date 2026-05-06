alter table public.classes
add column if not exists teacher_name text;

update public.classes set teacher_name = coalesce(teacher_name, 'Chưa xác định') where teacher_name is null;

alter table public.classes
alter column teacher_name set not null;
