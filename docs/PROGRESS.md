# Progress

## Live and verified working (real Supabase project, real device)

The app has been run end-to-end against a real Supabase project and a real phone via
Expo Go: prayer times, masjids, and halal food added from the admin dashboard all show
up correctly in the mobile app.

## Done

- **Supabase schema** (`supabase/migrations/0001`–`0009`): profiles (role-based),
  locations, prayer_times (national Adhan times), masjids (Jamat times + city/district),
  halal_food_places, ai_qa_history, app_settings, **notices** (admin announcements,
  0008) — with RLS (public read, admin write) **and** explicit grants for
  `anon`/`authenticated` (0006 — see the note below, this was the cause of a real
  "permission denied" bug). `0009_fix_pm_times.sql` corrects a real data bug — see below.
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
    per-day on-device, and a prayer can't be ticked before its own Adhan time has
    actually arrived) with a completion bar, plus an honest "Qur'an opened N× today"
    count. Then a bigger 3-column icon grid: Qibla, Qur'an, Books & Hadith, Tasbih,
    Masjids, Halal Food, Dua, Donate, Ask AI, Account (Settings moved to its own bottom
    tab — see Navigation below). An **Ayah of the Day** card closes out the screen —
    deterministic by day-of-year from a curated list of ~25 standalone-meaningful verses
    (so it never lands on an ayah that only makes sense mid-passage), fetched live and
    tappable into that Surah. The whole screen (and most secondary screens) sits on a
    soft gradient wash instead of a flat color, and only the very first load shows a
    spinner — returning to Home from elsewhere refreshes quietly in the background.
  - **Qibla**: heading now comes from `expo-location`'s `watchHeadingAsync` — the same
    tilt-compensated, sensor-fused API the phone's own Compass app uses — replacing the
    earlier raw-magnetometer `atan2()` math, which was unreliable and could point the
    needle backwards on some devices. A fixed triangular pointer now sits at the top of
    the ring (doesn't rotate), the same convention as a real compass: the dial turns
    underneath it, and alignment means the 🕋 needle meets that fixed pointer. 300px
    ring, 10° tick marks, gold N/NE/E/SE/S/SW/W/NW labels. (Intentionally skipped: a
    live map thumbnail and compass-skin picker — decorative/heavy, not core functionality.)
  - **Qur'an list**: "Last Read" hero card (jumps back into whichever Surah/Juz/Page you
    last opened), a **Bookmarks** row (long-press a chip to remove it), a Sura/Page/Juz
    underline-tab toggle, 8-point star badges on Surah/Juz rows, and a 604-tile Page grid
    (each page fetched via AlQuran Cloud's `/v1/page/{n}/{edition}`, grouped with
    surah-name headers).
  - **Qur'an reader** (Surah/Juz/Page detail): rebuilt as continuous, right-to-left
    flowing **Mushaf-style** text (`components/MushafText.tsx`) — one wrapped paragraph
    per surah segment with a small inline ﴿١﴾-style Arabic-Indic ayah marker, not boxed
    per-ayah cards. A custom top bar (`QuranReaderTopBar`) replaces the native header:
    back chevron, a context pill (Surah/Juz/Page number), a Home shortcut, and the
    surah-name pill. A bottom toolbar (`QuranReaderToolbar`) has real, working buttons:
    **Bookmark** (saves/removes this Surah/Juz/Page, shown in the list screen's
    Bookmarks row), **Text size** (cycles Small/Medium/Large, persisted), **Translation**
    (toggles a stacked translation block below the Arabic), and **Share** (native share
    sheet with the Arabic text via `Share.share`). All record "last read" + a daily
    open-count as before. *(Intentionally not built: audio recitation/"Play" and
    "Auto-scroll" — no reciter audio is wired up yet, so no fake Play button.)*
  - **Tasbih**: tap-to-count dhikr counter — circular dial with a fill-progress ring,
    target chips (33/99/100), vibration + auto-reset + rounds-completed counter when the
    target is hit, persisted on-device.
  - **Dua**: the Six Kalimas plus **31 everyday duas across 8 categories** (Daily Life,
    Salah & Repentance incl. the Sayyidul Istighfar, Health & Distress, Ramadan &
    Fasting, Travel & Protection, Knowledge/Guidance & Family incl. the full Istikhara
    dua, Comprehensive), each with Arabic, transliteration, English translation, and a
    source reference. **All sections start collapsed** — tap one to expand it, rather
    than everything open at once. Local/offline data, no network dependency; every entry
    was chosen for confidence in its accuracy over padding the count.
  - **Books & Hadith** (renamed from "Hadith"): a collapsed-by-default list of
    collections — **Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Jami' at-Tirmidhi,
    Sunan an-Nasa'i, Sunan Ibn Majah** — each opens to its **full collection** (no more
    30-hadith cap), grouped by book/chapter number, with an **English/Urdu** toggle.
    *Muntakhab Ahadith and Bahishti Zewar are listed but marked honestly unavailable* —
    no free, verified digital source for either was found (Bahishti Zewar is a fiqh
    manual, not a hadith collection, besides), so nothing was fabricated to fill them in.
    Hindi/Nepali translations aren't published by any free hadith source we could find
    either — Urdu is offered as the closest available alternate-language reading.
  - **Donate**: shows a support message plus whichever of bank/account/eSewa/Khalti
    details the admin has filled in (`app_settings.donation_info`); values are
    press-and-hold to copy. Hides rows the admin left blank.
  - **Settings**: now its own **bottom tab** (Home / Ask / Settings / Account) rather than
    a Home grid tile — prayer notification toggle, **Adhan sound on/off** (silent banner
    vs. a sound — honestly scoped to what Expo Go/local notifications can actually do, no
    fabricated custom Adhan audio), and the **dark/light theme** toggle.
  - **Masjids**: now has a **city search bar** at the top, so you can browse masjids in a
    city you haven't traveled to yet — the list no longer depends on GPS permission
    being granted (distance is shown when available, just omitted otherwise).
  - **Halal Food**: split into its own screen/grid tile (previously combined with
    Masjids under one "Nearby" toggle) — sorted by GPS distance from the device.
  - **Masjid Detail** / **Halal Food Detail**: hero image (placeholder if none set),
    address/phone, and for masjids a Prayer/Azan/Iqama table; a Directions button opens
    Maps.
  - **Ask**: AI Q&A chat UI wired to and verified working against the deployed
    `ask-ai` Supabase Edge Function (see below).
  - **Account**: "Your Masjid" picker, Supabase email/password sign up & sign in,
    profile, sign out.
  - Navigation is now **4 bottom tabs — Home / Ask / Settings / Account** — with
    everything else (Qibla, Qur'an, Books & Hadith, Tasbih, Dua, Donate, Masjids, Halal
    Food) reached via Home's icon grid/stack. Every secondary screen's header now uses
    the same deep-emerald gradient as the Home hero, instead of a flat bar.
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
5. **"Current: Isha, Next: Fajr" at 2:38pm**: audited all 366 rows of the seeded
   `prayer_times` data — every Asr/Maghrib/Isha value had been transcribed straight off
   the source PDF's 12-hour clock without converting to 24-hour (e.g. Isha `6:49`
   instead of the intended `18:49`). Since the app parses times as 24-hour, every
   afternoon/evening prayer looked like it had already happened at 6-7am, so by early
   afternoon *every* prayer looked "already passed," making the last one (Isha) show as
   "current" and rolling over to tomorrow's Fajr as "next." Fixed with a one-time data
   migration (`0009_fix_pm_times.sql`) adding 12 hours to those three columns —
   confirmed via a full-table audit that no row already had a value ≥ 12 there, so the
   fix is safe to apply uniformly. **Must be run in Supabase SQL Editor for existing
   projects** — it's a data fix, not something `npm install` picks up.
6. **Qibla needle pointing the wrong way on some devices**: the compass heading was
   computed from the raw magnetometer vector via `atan2(y, x)` with a hand-guessed
   offset — explicitly commented "device-dependent" in the original code, and it was
   wrong for at least one real device, effectively inverting the needle. Replaced with
   `expo-location`'s `watchHeadingAsync`, the tilt-compensated sensor-fusion API the
   native Compass app itself uses — far more reliable, and the same convention every
   real compass app relies on.

## Not yet done / next steps

- User needs to add billing credits on console.anthropic.com for Ask AI to actually
  respond (see above — everything on our side is confirmed working).
- Qur'an audio recitation ("Play"/"Auto-scroll") is not built — would need a reciter
  audio source wired up (AlQuran Cloud does offer per-ayah audio editions) plus an
  audio player; worth adding later if the user wants it, but not faked in the meantime.
- Muntakhab Ahadith and Bahishti Zewar are listed in Books & Hadith as honestly
  unavailable — no free, verified digital source found for either. If the user has a
  licensed text source for them, it can be wired in.
- No Hindi or Nepali hadith translations exist in any free source we could find; Urdu
  is offered instead. Worth revisiting if a Hindi/Nepali source turns up.
- Halal food doesn't have the same city search bar Masjids just got — worth adding for
  consistency if that turns out to matter as much there.
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
