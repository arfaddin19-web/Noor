-- Noor: initial schema
-- Extensions
create extension if not exists "pgcrypto";

-- =========================================================
-- profiles (extends auth.users)
-- =========================================================
create type user_role as enum ('user', 'admin');

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  role user_role not null default 'user',
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- =========================================================
-- locations — a place with its own prayer time schedule
-- =========================================================
create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,                 -- e.g. "Bhairahawa, Nepal"
  country text,
  latitude double precision,
  longitude double precision,
  timezone text not null default 'Asia/Kathmandu',
  source text,                        -- e.g. "IQRA Tutorial Hub calendar"
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- Only one default location
create unique index if not exists one_default_location
  on locations (is_default)
  where is_default;

-- =========================================================
-- prayer_times — one row per (location, month, day)
-- Year-agnostic: the same printed local calendar is reused every year.
-- Feb 29 rows are simply skipped by the app in non-leap years.
-- =========================================================
create table if not exists prayer_times (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations (id) on delete cascade,
  month smallint not null check (month between 1 and 12),
  day smallint not null check (day between 1 and 31),
  fajr time not null,
  sunrise time not null,
  dhuhr time not null,     -- "Zohr" on the source calendar
  asr time not null,
  maghrib time not null,
  isha time not null,
  jumma time,               -- optional Friday/Jumu'ah congregation time override
  unique (location_id, month, day)
);

create index if not exists prayer_times_lookup
  on prayer_times (location_id, month, day);

-- =========================================================
-- masjids
-- =========================================================
create table if not exists masjids (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  latitude double precision not null,
  longitude double precision not null,
  phone text,
  description text,
  photo_url text,
  jumma_time time,
  is_approved boolean not null default true,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create index if not exists masjids_geo on masjids (latitude, longitude);

-- =========================================================
-- halal_food_places
-- =========================================================
create type food_category as enum ('restaurant', 'cafe', 'bakery', 'grocery', 'butcher', 'other');

create table if not exists halal_food_places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category food_category not null default 'restaurant',
  address text,
  latitude double precision not null,
  longitude double precision not null,
  phone text,
  halal_certified boolean not null default false,
  description text,
  photo_url text,
  is_approved boolean not null default true,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create index if not exists halal_food_geo on halal_food_places (latitude, longitude);

-- =========================================================
-- ai_qa_history — Islamic Q&A feature log
-- =========================================================
create table if not exists ai_qa_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete set null,
  question text not null,
  answer text not null,
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists ai_qa_history_user on ai_qa_history (user_id, created_at desc);

-- =========================================================
-- app_settings — small admin-editable key/value config
-- =========================================================
create table if not exists app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
