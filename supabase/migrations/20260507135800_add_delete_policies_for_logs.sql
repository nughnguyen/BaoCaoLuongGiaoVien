-- Fix: allow authenticated users to delete their own logs/checkins

drop policy if exists "daily_checkins_delete_own" on public.daily_checkins;
create policy "daily_checkins_delete_own" on public.daily_checkins
for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "attendance_logs_delete_own" on public.attendance_logs;
create policy "attendance_logs_delete_own" on public.attendance_logs
for delete to authenticated
using (user_id = (select auth.uid()));
