alter table public.classes
add column if not exists student_count integer not null default 1,
add column if not exists branch_name text not null default 'Cơ bản';

-- Update existing classes if needed
update public.classes set student_count = 1 where student_count is null;
update public.classes set branch_name = 'Cơ bản' where branch_name is null;
