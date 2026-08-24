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
  editable per-masjid from the admin dashboard (`0004_masjid_jamat_times.sql`). Masjid
  and halal food listings are both intentionally 100% manual, admin-uploaded data —
  no third-party places API.
- **Admin dashboard** (Next.js 16 / React 19, `/admin`): email/password login gated to
  admins, overview stats, prayer times (Adhan) editor per location/month, masjids CRUD
  with approve/reject and inline per-masjid Jamat time editing, halal food CRUD with
  approve/reject, AI Q&A log viewer with flagging. `npm run build` verified clean.
- **Mobile app** (Expo SDK 57 / React Native 0.81, `/mobile`): bottom-tab navigation with
  - Prayer Times home (today's Adhan times, live countdown to next prayer)
  - Qibla (compass bearing to the Kaaba using device location + magnetometer)
  - Qur'an (surah list + reader, Arabic + English translation via AlQuran Cloud API)
  - Hadith (browse major collections via a free hadith API)
  - Nearby (masjids with their Jamat times / halal food, sorted by distance from
    device GPS, tap to open in Maps)
  - Ask (AI Q&A chat UI wired to the `ask-ai` Supabase Edge Function)
  - Account (Supabase email/password sign up & sign in, profile, sign out, and the
    prayer notification toggle)
- **Push notifications**: `mobile/lib/notifications.ts` schedules a local notification
  for each remaining Fajr/Dhuhr/Asr/Maghrib/Isha Adhan over the next 7 days at the
  default location, toggled from the Account tab; re-schedules cleanly on every toggle
  so nothing piles up.
- **AI Q&A edge function** (`supabase/functions/ask-ai`): proxies to Claude with an
  Islamic-Q&A system prompt (encourages citing sources honestly, defers fiqh rulings to
  qualified scholars), logs every exchange to `ai_qa_history`.
- **App icons**: placeholder crescent-mark icon/splash/adaptive-icon/favicon generated
  and wired into `app.json` (via the `expo-splash-screen` plugin, since the old
  top-level `splash` key is deprecated on current SDKs) — swap these for real branding
  whenever you have it.

## Verified in this sandbox

- `admin`: `npm install`, `tsc --noEmit`, and a full `next build` all pass clean (0
  vulnerabilities after bumping to Next 16 / React 19).
- `mobile`: `npm install` and `tsc --noEmit` pass clean; `npx expo export --platform
  ios` successfully bundles all ~986 modules via Metro (proves every import/screen
  wires together correctly). The one thing that doesn't complete here is the final
  Hermes bytecode compile step — this sandbox doesn't have a working `hermesc`/network
  path for it — so a real device/EAS build is still the first real end-to-end test.
  `expo install --fix`'s compatibility check also couldn't run (its API host is
  blocked in this sandbox); dependency versions were instead hand-matched to Expo SDK
  57 via the npm registry, so it's worth running `npx expo install --fix` yourself
  once you have unrestricted network, as a final check.

## Not yet done / next steps

- **No real Supabase project is wired up** — create one and fill in the URL/keys (see
  `docs/SETUP.md`) before anything will actually load data.
- Qibla compass heading math is a reasonable first pass but should be tested on a real
  device — magnetometer calibration/tilt-compensation varies by phone.
- Account/profile is intentionally minimal (name, sign out, notification toggle) — no
  password reset flow, avatar upload, or saved/favorite masjids yet.
- Push notifications are local-only (scheduled on-device for the next 7 days); there's
  no server-side push (Expo Push/FCM/APNs) for things like admin broadcast messages.
- No app store metadata/build profiles (EAS) set up yet — this is still a dev-mode app.
