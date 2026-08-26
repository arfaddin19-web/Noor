# Progress

## Live and verified working (real Supabase project, real device)

The app has been run end-to-end against a real Supabase project and a real phone via
Expo Go: prayer times, masjids, and halal food added from the admin dashboard all show
up correctly in the mobile app.

## Done

- **Supabase schema** (`supabase/migrations/0001`–`0007`): profiles (role-based),
  locations, prayer_times (national Adhan times), masjids (Jamat times + city/district),
  halal_food_places, ai_qa_history, app_settings — with RLS (public read, admin write)
  **and** explicit grants for `anon`/`authenticated` (0006 — see the note below, this
  was the cause of a real "permission denied" bug).
- **Prayer time data**: transcribed from the IQRA Tutorial Hub calendar PDF, seeded as
  a single nationwide **Nepal** location (366 rows = 365 days + Feb 29).
- **Adhan vs. Jamat**: `prayer_times` holds the national Adhan (start) times; each
  masjid has its own Fajr/Dhuhr/Asr/Maghrib/Isha/Jumu'ah **Jamat** (congregation) time.
  Masjid and halal food listings are 100% manual, admin-uploaded data — no third-party
  places API.
- **"Your Masjid" personalization**: on first launch (after onboarding), and any time
  from Account → "Your Masjid", the user picks a district/city then a masjid from that
  city (from real data — the dropdown is populated from `masjids.city`). Once set,
  Home's hero card shows that masjid by name and adds its Jamat time for the next
  prayer; the "Mosques" row filters to that city too. Stored on-device (AsyncStorage),
  skippable, changeable anytime — falls back to the generic nationwide Adhan display
  when unset.
- **Admin dashboard** (Next.js 16 / React 19, `/admin`): email/password login gated to
  admins, overview stats, prayer times (Adhan) editor, masjids CRUD (incl. city) with
  approve/reject and inline Jamat time editing, halal food CRUD with approve/reject, AI
  Q&A log viewer with flagging. `npm run build` verified clean.
- **Mobile app** (Expo SDK 54 / React Native 0.81, `/mobile`) — redesigned to match
  user-supplied reference mockups:
  - **Onboarding**: 3-slide intro (dark sky gradient + a dependency-free View-based
    mosque skyline), shown once, then the masjid picker above.
  - **Home**: frosted-glass prayer hero card (location/masjid, Gregorian + approximate
    Hijri date, next-prayer countdown, Jamat line when a masjid is set), a 2×3 icon
    grid (Qibla, Qur'an, Hadith, Halal Food, Ask, Account), and a "Mosques" card row.
  - **Qibla**: two-point alignment compass — a fixed marker at the top of the ring
    (your phone's facing direction) and a rotating dial with N/E/S/W + a 🕋 mark at the
    Qibla bearing; both turn green and align when you're facing the right way.
  - **Masjid Detail** / **Halal Food Detail**: hero image (placeholder if none set),
    address/phone, and for masjids a Prayer/Azan/Iqama table; a Directions button opens
    Maps. Reached from Home's mosque cards, Nearby's list, and the masjid picker.
  - **Nearby**: masjids/halal food sorted by GPS distance; masjid rows now open Masjid
    Detail instead of jumping straight to Maps.
  - **Qur'an**: Surah/Para (Juz) toggle on the list screen — Juz mode fetches a
    para's ayahs (spanning multiple surahs) via AlQuran Cloud's `/v1/juz/{n}/{edition}`
    and shows a surah-name header wherever the surah changes within that Juz. Both
    readers (Surah and Juz) have a "Show translation" switch instead of always
    displaying it.
  - **Ask**: AI Q&A chat UI wired to and verified working against the deployed
    `ask-ai` Supabase Edge Function (see below).
  - **Account**: "Your Masjid" (see above), Supabase email/password sign up & sign in,
    profile, sign out, prayer notification toggle.
  - Navigation simplified to 3 bottom tabs — **Home / Ask / Account** — with Qibla,
    Qur'an, Hadith, and Nearby reached via Home's icon grid/stack instead of 7 cramped
    tabs.
  - UI polish pass: every screen now shares `theme.ts` tokens (colors/spacing/radius)
    and a common soft-elevation `cardShadow` on cards and primary buttons, replacing
    the flat/inconsistent styling most screens had right after the initial build.
- **Push notifications**: `mobile/lib/notifications.ts` schedules a local notification
  for each remaining Adhan over the next 7 days, toggled from Account; re-schedules
  cleanly on every toggle so nothing piles up.
- **AI Q&A**: `supabase/functions/ask-ai` proxies to Claude with an Islamic-Q&A system
  prompt, logs every exchange to `ai_qa_history`. **Deployed and verified working
  end-to-end** — app → edge function → Claude → back to the app, logged in the admin
  dashboard. Currently paused only because the user's Anthropic account has no billing
  credits yet (a real "your credit balance is too low" error from Anthropic, not a bug);
  nothing else to do here once credits are added.
- **App icons**: placeholder crescent-mark icon/splash/adaptive-icon/favicon.

## Real bugs found and fixed while testing on a real device/project

Worth keeping in mind if something looks broken again:

1. **AuthGate crash** (`admin/components/AuthGate.tsx`): was calling `router.replace()`
   directly during render instead of in a `useEffect`, which trips React's "Cannot
   update a component while rendering a different component" error — looked like sign-
   in silently failing. Fixed.
2. **"permission denied for table locations"**: RLS policies existed and were correct,
   but the base-level Postgres `GRANT`s to the `anon`/`authenticated` roles were
   missing (should be automatic on a fresh Supabase project; wasn't here). Fixed via
   `0006_grants.sql` — if a *new* table is ever added, remember it needs an explicit
   `grant select ...` too, RLS policies alone aren't sufficient.
3. **Expo Go SDK mismatch**: the project was originally on Expo SDK 57, but the
   reporter's actual installed Expo Go client only supported SDK 54 (App Store rollout
   lag). Stepped every expo-*/react-native package to the exact SDK 54 template
   versions. If this recurs, check Expo Go's own Settings screen for its SDK version
   rather than assuming "latest npm version" is safe.
4. **Ask AI "couldn't reach the server" when signed out**: `AskAiScreen` sent
   `Authorization: Bearer ` (empty string) when there was no user session, which
   Supabase's function gateway rejects outright. Ask AI is meant to work without
   signing in — fixed by falling back to the public anon key (both as `apikey` and as
   the bearer token) when signed out, same as every other Supabase call in the app.

## Not yet done / next steps

- User needs to add billing credits on console.anthropic.com for Ask AI to actually
  respond (see above — everything on our side is confirmed working).
- **Qibla redesign** — user is sending a reference image for how they want it to look;
  revisit once received (current version has the two-point alignment fix but not yet
  matched to their preferred visual style).
- Qibla compass heading math is a reasonable first pass but should be checked for
  accuracy on a real device — magnetometer calibration/tilt-compensation varies by
  phone.
- Halal food doesn't have a city filter/picker like masjids do yet.
- Account/profile is intentionally minimal (name, sign out) — no password reset flow
  or avatar upload yet.
- Push notifications are local-only; no server-side push (Expo Push/FCM/APNs) for
  things like admin broadcast messages.
- No app store metadata/build profiles (EAS) set up yet — this is still a dev-mode app
  run via Expo Go, not a standalone installable build.
- If the icon grid on Home gets more entries later (Dua, Islamic Calendar, Community,
  etc. were in the original reference mockups but aren't built), consider adding a
  "More" tile that opens a secondary menu screen rather than growing the 2×3 grid.
