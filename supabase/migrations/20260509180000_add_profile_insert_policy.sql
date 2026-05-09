-- Add INSERT policy for profiles to allow upserting own profile
create policy "profiles_insert_own"
on public.profiles for insert to authenticated
with check (id = auth.uid());
