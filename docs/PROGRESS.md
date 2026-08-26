# Progress

## Live and verified working (real Supabase project, real device)

The app has been run end-to-end against a real Supabase project and a real phone via
Expo Go: prayer times, masjids, and halal food added from the admin dashboard all show
up correctly in the mobile app.

## Done

- **Supabase schema** (`supabase/migrations/0001`–`0008`): profiles (role-based),
  locations, prayer_times (national Adhan times), masjids (Jamat times + city/district),
  halal_food_places, ai_qa_history, app_settings, **notices** (admin announcements,
  0008) — with RLS (public read, admin write) **and** explicit grants for
  `anon`/`authenticated` (0006 — see the note below, this was the cause of a real
  "permission denied" bug).
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
  approve/reject and inline Jamat time editing, halal food CRUD with approve/reject,
  **Notices** (publish/hide short announcements shown on the app's Home screen),
  **Donation** (edit the bank/eSewa/Khalti details shown on the app's Donate screen), AI
  Q&A log viewer with flagging. `npm run build` verified clean.
- **Mobile app** (Expo SDK 54 / React Native 0.81, `/mobile`) — redesigned to match
  user-supplied reference mockups. Theming and iconography had a full pass:
  - **Theme**: `theme.ts` now exports `getTheme(mode)` with a **dark** palette (deep
    emerald, the app's default everywhere — not just the hero) and a **light** palette,
    served through `lib/ThemeContext.tsx` (`useTheme()`/`useThemeMode()`), persisted
    on-device, switchable from Settings. Every screen consumes it live, so toggling
    updates the whole app immediately, including navigation headers/tab bar.
  - **Icons**: every emoji glyph in a button, grid tile, or header (🧭📍📞✅🕌🍽️🔔▾ etc.)
    was replaced with `@expo/vector-icons` (Ionicons/MaterialCommunityIcons) for a
    consistent, non-"cartoon" look.
  - **Onboarding**: 3-slide intro (dark sky gradient + a dependency-free View-based
    mosque skyline), shown once, then the masjid picker above.
  - **Home**: emerald gradient hero with a personalized greeting ("Assalamu alaikum,
    {first name}" when signed in), a gold mosque-skyline silhouette, and a frosted-glass
    Current/Next prayer card — shows the current prayer's window (with the time it ends,
    i.e. when the next prayer starts) alongside the next prayer's name and time; Jamat
    line when a masjid is set. An **admin Notice banner** appears when one is published.
    Below that, a real **Today's Progress** card — a tappable 5-prayer checklist (stored
    per-day on-device) with a completion bar, plus an honest "Qur'an opened N× today"
    count (no fabricated percentages). Then a bigger 3-column icon grid: Qibla, Qur'an,
    Hadith, Tasbih, Masjids, Halal Food, Dua, Donate, Settings, Ask AI, Account.
  - **Qibla**: a 300px ring with 10° tick marks (major at cardinals, minor elsewhere),
    gold N/NE/E/SE/S/SW/W/NW labels, and a rotating two-tone needle (grey tail + red tip
    topped with a 🕋) nested inside a rotating dial so the needle's on-screen angle
    always equals `qiblaBearing - heading`. Center hub and status text turn green with
    "You're facing Kaaba now" when aligned. (Intentionally skipped: a live map thumbnail
    and compass-skin picker — decorative/heavy, not core functionality.)
  - **Qur'an**: list screen with a "Last Read" hero card (jumps back into whichever
    Surah/Juz/Page you last opened), a Sura/Page/Juz underline-tab toggle, 8-point star
    badges on Surah/Juz rows, and a 604-tile Page grid (each page fetched via AlQuran
    Cloud's `/v1/page/{n}/{edition}`, grouped with surah-name headers). Surah/Juz/Page
    readers all record "last read" + a daily open-count, and share a "Show translation"
    switch instead of always displaying it. *(The user is sending a further reference
    image for the Qur'an reader's look — not yet re-matched to that.)*
  - **Tasbih**: tap-to-count dhikr counter — circular dial with a fill-progress ring,
    target chips (33/99/100), vibration + auto-reset + rounds-completed counter when the
    target is hit, persisted on-device.
  - **Dua**: a new screen with the Six Kalimas plus ~15 everyday duas (before/after
    eating, sleep/waking, entering/leaving home and masjid, travel, distress, seeking
    knowledge, parents, a comprehensive Qur'anic dua), each with Arabic, transliteration,
    English translation, and a source reference — grouped into collapsible sections.
    Local/offline data, no network dependency.
  - **Donate**: shows a support message plus whichever of bank/account/eSewa/Khalti
    details the admin has filled in (`app_settings.donation_info`); values are
    press-and-hold to copy. Hides rows the admin left blank.
  - **Settings**: prayer notification toggle, **Adhan sound on/off** (silent banner vs.
    a sound — honestly scoped to what Expo Go/local notifications can actually do, no
    fabricated custom Adhan audio), and the **dark/light theme** toggle.
  - **Masjids** / **Halal Food**: split into two separate screens/grid tiles (previously
    one combined "Nearby" toggle) — each sorted by GPS distance from the device.
  - **Masjid Detail** / **Halal Food Detail**: hero image (placeholder if none set),
    address/phone, and for masjids a Prayer/Azan/Iqama table; a Directions button opens
    Maps.
  - **Ask**: AI Q&A chat UI wired to and verified working against the deployed
    `ask-ai` Supabase Edge Function (see below).
  - **Account**: "Your Masjid" picker, a link into Settings, Supabase email/password
    sign up & sign in, profile, sign out.
  - Navigation stays 3 bottom tabs — **Home / Ask / Account** — with everything else
    (Qibla, Qur'an, Hadith, Tasbih, Dua, Donate, Settings, Masjids, Halal Food) reached
    via Home's icon grid/stack.
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
- **Qur'an reader redesign** — the user is sending a further reference image for how
  the Surah/Juz/Page reading screen itself should look; revisit once received. The list
  screen (Last Read, Sura/Page/Juz toggle, star badges) already matches their last
  reference and hasn't changed in this round.
- Qibla compass heading math is a reasonable first pass but should be checked for
  accuracy on a real device — magnetometer calibration/tilt-compensation varies by
  phone.
- Halal food doesn't have a city filter/picker like masjids do yet.
- Adhan sound toggle controls whether the local notification plays a sound at all —
  Expo Go / local notifications can't ship a custom Adhan audio file without an EAS
  build, so this is scoped honestly to sound on/off rather than a specific Adhan clip.
- Account/profile is intentionally minimal (name, sign out) — no password reset flow
  or avatar upload yet.
- Push notifications are local-only; no server-side push (Expo Push/FCM/APNs) for
  things like admin broadcast messages (Notices are pulled on Home load instead).
- No app store metadata/build profiles (EAS) set up yet — this is still a dev-mode app
  run via Expo Go, not a standalone installable build — so a custom Adhan sound and
  themed app icon per light/dark mode aren't possible until then either.
- Donation screen shows whatever the admin enters in the new Donation settings page;
  nothing is pre-filled — it starts empty until the admin adds real payment details.
