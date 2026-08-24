# Progress

## Done

- **Supabase schema** (`supabase/migrations/0001`–`0005`): profiles (role-based),
  locations, prayer_times (national Adhan times), masjids (incl. per-prayer Jamat time
  columns), halal_food_places, ai_qa_history, app_settings — with RLS (public read,
  admin write).
- **Prayer time data** transcribed from the IQRA Tutorial Hub calendar PDF and seeded
  as a single nationwide **Nepal** location (`0003_seed_prayer_times.sql`, 366 rows =
  365 days + Feb 29; `0005_update_default_location.sql` fixes the location to Nepal
  per your confirmation).
- **Adhan vs. Jamat**: `prayer_times` holds the national Adhan (start) times; each
  masjid has its own Fajr/Dhuhr/Asr/Maghrib/Isha/Jumu'ah **Jamat** (congregation) time,
  editable per-masjid from the admin dashboard (`0004_masjid_jamat_times.sql`).
- **Admin dashboard** (Next.js, `/admin`): email/password login gated to admins,
  overview stats, prayer times (Adhan) editor per location/month, masjids CRUD with
  approve/reject and inline per-masjid Jamat time editing, halal food CRUD with
  approve/reject, AI Q&A log viewer with flagging.
- **Mobile app** (Expo/React Native, `/mobile`): bottom-tab navigation with
  - Prayer Times home (today's Adhan times, live countdown to next prayer)
  - Qibla (compass bearing to the Kaaba using device location + magnetometer)
  - Qur'an (surah list + reader, Arabic + English translation via AlQuran Cloud API)
  - Hadith (browse major collections via a free hadith API)
  - Nearby (masjids with their Jamat times / halal food, sorted by distance from
    device GPS, tap to open in Maps)
  - Ask (AI Q&A chat UI wired to the `ask-ai` Supabase Edge Function)
- **AI Q&A edge function** (`supabase/functions/ask-ai`): proxies to Claude with an
  Islamic-Q&A system prompt (encourages citing sources honestly, defers fiqh rulings to
  qualified scholars), logs every exchange to `ai_qa_history`.

## Not yet done / next steps

- Nothing has been run/tested yet — this is unexecuted scaffolding written in a sandboxed
  session with no Node/Expo/Supabase CLI available. **You'll need to `npm install` and
  smoke-test both apps locally** (see `docs/SETUP.md`), and I'd expect a few fixes needed
  (dependency versions, minor type errors) once real tooling touches this code.
- No real Supabase project is wired up — you provide the URL/keys.
- No app icons/splash assets — placeholders only.
- Onboarding/auth screens for end users (sign up, profile) aren't built yet — the mobile
  app currently works fully anonymously except for the AI chat's optional history logging.
- Masjid/halal food data entry is 100% manual via the admin dashboard for now (no Google
  Places import).
- Qibla compass heading math is a reasonable first pass but should be tested on a real
  device — magnetometer calibration/tilt-compensation varies by phone.
- No push notifications for prayer time reminders yet.
