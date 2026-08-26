-- Mobile sign-up switched from faking an email address (which Supabase's
-- Auth server rejected outright — ".local" is an IETF-reserved special-use
-- domain its email validator refuses) to Supabase's native `phone` field on
-- auth.signUp. That means the phone number now lands on auth.users.phone
-- directly, not in raw_user_meta_data->>'phone' — update the signup trigger
-- to read it from there. full_name/city/gender are still passed through
-- options.data since there's no native column for them.

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, city, gender)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.phone,
    new.raw_user_meta_data ->> 'city',
    new.raw_user_meta_data ->> 'gender'
  );
  return new;
end;
$$ language plpgsql security definer;
