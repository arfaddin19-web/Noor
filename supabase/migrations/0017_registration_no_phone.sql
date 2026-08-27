-- Noor: drop phone number from registration — anyone could type any
-- number, there was never real verification behind it, so it wasn't a
-- trustworthy identifier for anything (least of all "who is this really").
-- New registration shape: Name, City, Gender, Occupation.
--
-- This also removes the "recover an existing registration by phone" path
-- (find_registration_by_phone, from 0013). A reinstalled app now just
-- registers fresh — an accepted tradeoff, since that recovery was only ever
-- a convenience built on an unverified number, not a real account.
--
-- Also adds is_premium, scaffolding for a future premium plan (audio
-- recitation, more Adhan sounds, etc. — see docs/PROGRESS.md). No payment
-- processing exists yet — that needs the app to actually be in the App
-- Store / Play Store first (in-app purchases). Until then this is a plain
-- boolean the admin can flip manually (e.g. to comp early supporters), read
-- by the app to decide whether to show premium-only features.

drop function if exists find_registration_by_phone(text);
drop index if exists registrations_phone_unique;
alter table registrations drop column if exists phone;

alter table registrations add column if not exists occupation text;
alter table registrations add column if not exists is_premium boolean not null default false;

comment on column registrations.occupation is
  'Free text, self-reported at registration (e.g. "Teacher", "Student", "Business").';
comment on column registrations.is_premium is
  'Manually granted by an admin for now — no in-app purchase flow exists until the app is distributed through the App Store / Play Store.';

-- The registrations table still has no general SELECT policy for
-- anon/authenticated (see 0013) — only admins can browse it. This narrow
-- RPC lets a device re-fetch its own row (e.g. to notice an admin just
-- granted it is_premium) by the random UUID it already has locally, the
-- same shape as 0013's now-removed find_registration_by_phone: it can only
-- ever return the one row whose exact id you already know, never a list.
create or replace function get_registration(p_id uuid)
returns table (id uuid, full_name text, city text, gender text, occupation text, is_premium boolean)
language sql
security definer
set search_path = public
as $$
  select id, full_name, city, gender, occupation, is_premium
  from registrations
  where id = p_id
  limit 1;
$$;

grant execute on function get_registration(uuid) to anon, authenticated;

-- 0013 only ever gave admins SELECT on registrations — no way to toggle
-- is_premium (or edit anything) from the dashboard until now.
create policy "registrations: admin update" on registrations
  for update using (is_admin()) with check (is_admin());

grant update on public.registrations to authenticated;
