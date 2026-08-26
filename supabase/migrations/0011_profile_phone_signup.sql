-- Adds phone/city/gender to profiles, for phone-number-based sign-up and to
-- let the admin dashboard see a rough population breakdown (city, gender) of
-- the community using the app. Existing RLS policies on profiles already
-- allow admins to read every row (`is_admin()` bypass in 0002_rls.sql), so
-- no policy changes are needed here — just the new columns.

alter table profiles add column if not exists phone text;
alter table profiles add column if not exists city text;
alter table profiles add column if not exists gender text check (gender in ('male', 'female'));

create unique index if not exists profiles_phone_unique on profiles (phone) where phone is not null;

-- Update the signup trigger to also populate these from auth metadata
-- (mobile/screens/AccountScreen.tsx passes them all in options.data on signUp).
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, city, gender)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'city',
    new.raw_user_meta_data ->> 'gender'
  );
  return new;
end;
$$ language plpgsql security definer;
