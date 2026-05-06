alter table public.classes
add column if not exists schedule_details jsonb default '[]'::jsonb;

-- Convert existing schedule integer[] to schedule_details jsonb
-- Assuming default 1 hour from 19:00 to 20:00 for existing schedules if needed, 
-- but it's okay to just leave it empty and let the user update it.
