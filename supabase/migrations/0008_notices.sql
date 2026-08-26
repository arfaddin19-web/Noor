-- Notices: short announcements the admin can publish, shown in a banner on the
-- mobile Home screen (e.g. "Eid prayer will be held at..."). Same public-read /
-- admin-write pattern as masjids/halal food.

create table if not exists notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table notices enable row level security;

create policy "notices: public read active" on notices
  for select using (is_active or is_admin());

create policy "notices: admin manage" on notices
  for all using (is_admin()) with check (is_admin());

grant select on public.notices to anon, authenticated;
grant insert, update, delete on public.notices to authenticated;

-- Seed an empty donation_info row in app_settings if one doesn't exist yet, so
-- the admin dashboard's Donation settings page has something to edit from
-- rather than starting from a missing key.
insert into app_settings (key, value)
values ('donation_info', '{"message": "", "bank_name": "", "account_name": "", "account_number": "", "esewa_id": "", "khalti_id": ""}'::jsonb)
on conflict (key) do nothing;
