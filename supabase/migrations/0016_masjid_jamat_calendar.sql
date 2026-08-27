-- Noor: yearly, day-by-day Jamat (congregation) times per masjid — replaces
-- the need to hand-enter (or ask Claude to enter) a single fixed Jamat time
-- per prayer. Mirrors prayer_times' own shape: one row per (masjid, month,
-- day), the same printed calendar reused every year, Feb 29 only used in
-- leap years. Uploaded via a CSV from the admin dashboard's Masjids page —
-- see admin/components/JamatCalendarUpload.tsx.
--
-- masjids.fajr_jamat/dhuhr_jamat/etc. (the single flat columns from earlier
-- migrations) are kept as a fallback: a masjid with no row here yet just
-- keeps showing its one fixed time, same as before this migration.

create table if not exists masjid_jamat_times (
  id uuid primary key default gen_random_uuid(),
  masjid_id uuid not null references masjids (id) on delete cascade,
  month smallint not null check (month between 1 and 12),
  day smallint not null check (day between 1 and 31),
  fajr time,
  dhuhr time,
  asr time,
  maghrib time,
  isha time,
  jumma time,
  unique (masjid_id, month, day)
);

create index if not exists masjid_jamat_times_lookup
  on masjid_jamat_times (masjid_id, month, day);

alter table masjid_jamat_times enable row level security;

-- Same visibility as the masjid itself: public if the masjid is approved
-- (or you're an admin, so unapproved/pending masjids are still visible in
-- the dashboard).
create policy "masjid_jamat_times: public read approved" on masjid_jamat_times
  for select using (
    exists (
      select 1 from masjids m
      where m.id = masjid_id and (m.is_approved or is_admin())
    )
  );

create policy "masjid_jamat_times: admin manage" on masjid_jamat_times
  for all using (is_admin()) with check (is_admin());

grant select on public.masjid_jamat_times to anon, authenticated;
grant insert, update, delete on public.masjid_jamat_times to authenticated;
