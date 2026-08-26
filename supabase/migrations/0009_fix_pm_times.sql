-- Bug fix: the IQRA Tutorial Hub calendar's Asr/Maghrib/Isha columns were
-- transcribed straight off the source PDF's 12-hour clock without converting
-- to 24-hour format (e.g. Isha '6:49' was stored instead of the intended
-- 18:49). Audited all 366 rows: every asr/maghrib/isha value is < 12, i.e.
-- consistently missing "+12 hours" for PM, so a uniform fix is safe.
--
-- This is what caused the app's "current/next prayer" logic to misfire in
-- the afternoon (e.g. showing "Current: Isha, Next: Fajr" at 2:38pm) — every
-- afternoon/evening prayer parsed as if it were in the early morning.
--
-- asr/maghrib/isha are native `time` columns, so no text cast/to_char is
-- needed — Postgres just adds the interval directly (and wraps within the
-- 24h cycle, though nothing here is close enough to midnight for that to
-- matter).

update prayer_times
set
  asr = asr + interval '12 hours',
  maghrib = maghrib + interval '12 hours',
  isha = isha + interval '12 hours'
where location_id = '00000000-0000-0000-0000-000000000001';
