-- Sign-up with a password is being dropped entirely — both the earlier
-- synthetic-email approach and native Supabase phone auth turned into
-- repeated friction (the ".local" email rejection, then the Phone provider
-- needing a dashboard toggle that didn't get switched on). Replaced with a
-- one-time local record: Name, Phone, City, Gender, no password, no
-- Supabase Auth session at all. This table is NOT linked to auth.users —
-- it exists purely to collect population data and let the app greet people
-- by name, independent of any login. (auth.users/profiles remain exactly as
-- they were, and are now effectively admin-only — the app's real Supabase
-- Auth accounts are just the people who can sign into the admin dashboard.)

create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  city text,
  gender text check (gender in ('male', 'female')),
  created_at timestamptz not null default now()
);

create unique index if not exists registrations_phone_unique on registrations (phone);

alter table registrations enable row level security;

-- No SELECT policy for anon/authenticated — this table is not browsable by
-- the app (see find_registration_by_phone below for the one narrow lookup
-- it's allowed to do). Anyone can insert their own registration since
-- there's no session to scope an "own row" check to.
create policy "registrations: anyone can insert" on registrations
  for insert with check (true);

-- Admins (the app's real Supabase Auth accounts, unaffected by this change)
-- can read everything, for the dashboard's population stats.
create policy "registrations: admin can select" on registrations
  for select using (is_admin());

grant insert on registrations to anon, authenticated;
grant select on registrations to authenticated;

-- Lets a device that lost its local "you're registered" state (reinstall,
-- cleared storage) recover its record by phone number without needing a
-- password. Returns only the one row matching the exact phone given, so it
-- can't be used to browse or enumerate everyone else's data — same
-- exposure as a "forgot password" phone lookup elsewhere.
create or replace function find_registration_by_phone(p_phone text)
returns table (id uuid, full_name text, phone text, city text, gender text)
language sql
security definer
set search_path = public
as $$
  select id, full_name, phone, city, gender
  from registrations
  where phone = p_phone
  limit 1;
$$;

grant execute on function find_registration_by_phone(text) to anon, authenticated;
