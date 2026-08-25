-- Noor: explicit privilege grants for PostgREST roles (anon / authenticated).
--
-- RLS policies (0002_rls.sql) define WHO can see/change WHAT rows, but Postgres
-- requires a more basic table-level GRANT before RLS is even evaluated. This
-- should normally happen automatically on a fresh Supabase project — it didn't
-- here, which is why reads/writes were failing with "permission denied for
-- table ..." even though the RLS policies themselves were correct.

grant usage on schema public to anon, authenticated;

-- Public read tables
grant select on public.locations to anon, authenticated;
grant select on public.prayer_times to anon, authenticated;
grant select on public.masjids to anon, authenticated;
grant select on public.halal_food_places to anon, authenticated;
grant select on public.app_settings to anon, authenticated;

-- Admin-managed tables: signed-in users may attempt writes; RLS's is_admin()
-- check (see 0002_rls.sql) still gates which rows/operations actually succeed.
grant insert, update, delete on public.locations to authenticated;
grant insert, update, delete on public.prayer_times to authenticated;
grant insert, update, delete on public.masjids to authenticated;
grant insert, update, delete on public.halal_food_places to authenticated;
grant insert, update on public.app_settings to authenticated;

-- profiles: users read/update their own row (RLS-gated).
grant select, update on public.profiles to authenticated;

-- ai_qa_history: signed-in users read their own history (RLS-gated); admins
-- read all. Inserts from the app normally go through the ask-ai edge function
-- (which uses the service role and bypasses RLS/grants), but this covers any
-- direct client use too.
grant select, insert on public.ai_qa_history to anon, authenticated;
