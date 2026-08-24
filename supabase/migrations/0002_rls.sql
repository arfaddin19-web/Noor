-- Noor: Row Level Security policies
-- Model: anonymous/mobile users can read public content; only admins can write.

alter table profiles enable row level security;
alter table locations enable row level security;
alter table prayer_times enable row level security;
alter table masjids enable row level security;
alter table halal_food_places enable row level security;
alter table ai_qa_history enable row level security;
alter table app_settings enable row level security;

-- Helper: is the current user an admin?
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

-- ---------- profiles ----------
create policy "profiles: read own" on profiles
  for select using (auth.uid() = id or is_admin());

create policy "profiles: update own" on profiles
  for update using (auth.uid() = id or is_admin());

-- ---------- locations ----------
create policy "locations: public read" on locations
  for select using (true);

create policy "locations: admin write" on locations
  for all using (is_admin()) with check (is_admin());

-- ---------- prayer_times ----------
create policy "prayer_times: public read" on prayer_times
  for select using (true);

create policy "prayer_times: admin write" on prayer_times
  for all using (is_admin()) with check (is_admin());

-- ---------- masjids ----------
create policy "masjids: public read approved" on masjids
  for select using (is_approved or is_admin());

create policy "masjids: authenticated suggest" on masjids
  for insert with check (auth.uid() is not null);

create policy "masjids: admin manage" on masjids
  for update using (is_admin()) with check (is_admin());

create policy "masjids: admin delete" on masjids
  for delete using (is_admin());

-- ---------- halal_food_places ----------
create policy "halal: public read approved" on halal_food_places
  for select using (is_approved or is_admin());

create policy "halal: authenticated suggest" on halal_food_places
  for insert with check (auth.uid() is not null);

create policy "halal: admin manage" on halal_food_places
  for update using (is_admin()) with check (is_admin());

create policy "halal: admin delete" on halal_food_places
  for delete using (is_admin());

-- ---------- ai_qa_history ----------
create policy "ai_qa: read own or admin" on ai_qa_history
  for select using (auth.uid() = user_id or is_admin());

create policy "ai_qa: insert own" on ai_qa_history
  for insert with check (auth.uid() = user_id or user_id is null);

-- ---------- app_settings ----------
create policy "settings: public read" on app_settings
  for select using (true);

create policy "settings: admin write" on app_settings
  for all using (is_admin()) with check (is_admin());
