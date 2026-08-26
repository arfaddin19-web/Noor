-- Community Help: masjid-affiliated social-work organizations/clubs that a
-- newcomer to a city can contact directly if they're in difficulty. Same
-- public-read-approved / admin-write pattern as masjids and halal food.

create table if not exists community_orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  contact_person text,
  designation text,
  phone text,
  description text,
  is_approved boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists community_orgs_city_idx on community_orgs (city);

alter table community_orgs enable row level security;

create policy "community_orgs: public read approved" on community_orgs
  for select using (is_approved or is_admin());

create policy "community_orgs: admin manage" on community_orgs
  for all using (is_admin()) with check (is_admin());

grant select on public.community_orgs to anon, authenticated;
grant insert, update, delete on public.community_orgs to authenticated;
