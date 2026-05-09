-- Drop problematic recursive policy
drop policy if exists "profiles_select_own_or_admin" on public.profiles;

-- Create a non-recursive select policy
-- Everyone can see their own profile
create policy "profiles_select_own"
on public.profiles for select to authenticated
using (id = auth.uid());

-- If admin functionality is needed without recursion, 
-- we can use jwt metadata or a security definer function.
-- For now, allowing own-select is the safest fix for the error.

-- Fix update policy too if needed (it was already id = auth.uid())
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());
