-- Noor: masjid-level Jamat (congregation) times
--
-- `prayer_times` holds the Adhan (start-of-window) times — the same for everyone in a
-- location, per the national calendar. Each masjid additionally sets its own Jamat
-- (congregation) time for each prayer, since masjids commonly delay the congregation a
-- few minutes after Adhan. These are entered per-masjid from the admin dashboard.

alter table masjids
  add column if not exists fajr_jamat time,
  add column if not exists dhuhr_jamat time,
  add column if not exists asr_jamat time,
  add column if not exists maghrib_jamat time,
  add column if not exists isha_jamat time;

alter table masjids rename column jumma_time to jumma_jamat;

comment on column masjids.fajr_jamat is 'Fajr congregation (Jamat) time at this masjid, set by the masjid/admin.';
comment on column masjids.dhuhr_jamat is 'Dhuhr/Zohr congregation (Jamat) time at this masjid.';
comment on column masjids.asr_jamat is 'Asr congregation (Jamat) time at this masjid.';
comment on column masjids.maghrib_jamat is 'Maghrib congregation (Jamat) time at this masjid.';
comment on column masjids.isha_jamat is 'Isha congregation (Jamat) time at this masjid.';
comment on column masjids.jumma_jamat is 'Friday Jumu''ah congregation (Jamat) time at this masjid.';

comment on column prayer_times.fajr is 'Fajr Adhan (start-of-window) time — national/regional calendar, not masjid-specific.';
comment on column prayer_times.dhuhr is 'Dhuhr/Zohr Adhan (start-of-window) time.';
comment on column prayer_times.asr is 'Asr Adhan (start-of-window) time.';
comment on column prayer_times.maghrib is 'Maghrib Adhan (start-of-window) time.';
comment on column prayer_times.isha is 'Isha Adhan (start-of-window) time.';
comment on column prayer_times.jumma is 'Optional Jumu''ah Adhan override for this location (falls back to dhuhr if not set).';
