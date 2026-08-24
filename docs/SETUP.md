# Setup

## 1. Create a Supabase project

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor (or via the Supabase CLI), run the migrations in
   `supabase/migrations/` **in order**:
   - `0001_init.sql` — tables
   - `0002_rls.sql` — row-level security policies
   - `0003_seed_prayer_times.sql` — seeds one default location with a full year of
     Adhan (start) times transcribed from the IQRA Tutorial Hub table calendar you
     shared
   - `0004_masjid_jamat_times.sql` — adds per-masjid Jamat (congregation) time columns
   - `0005_update_default_location.sql` — corrects the seeded location to "Nepal"
     (nationwide), per your confirmation that the calendar is a national schedule

   With the Supabase CLI installed and linked to your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

3. Create your first admin user:
   - In Supabase Dashboard → Authentication → Users, add a user (email + password).
   - In the SQL editor, promote them:
     ```sql
     update profiles set role = 'admin' where id = 'THEIR_USER_UUID';
     ```

## 2. Admin dashboard

```bash
cd admin
cp .env.example .env.local   # fill in your Supabase URL + anon key
npm install
npm run dev
```
Open http://localhost:3000, sign in with the admin user you created.

## 3. Mobile app

Edit `mobile/app.json` → `expo.extra` with your Supabase URL + anon key (or wire up
`app.config.ts` + a `.env` if you prefer not to commit them).

```bash
cd mobile
npm install
npx expo start
```
Scan the QR code with Expo Go, or run `npm run ios` / `npm run android`.

Notes:
- The Account tab is optional for end users — the rest of the app (prayer times,
  Qibla, Qur'an, Hadith, Nearby, Ask) all work signed-out. Signing up/in just attaches
  Ask history to the account and lets prayer-time notifications persist a preference.
- Prayer notifications are local, on-device (via `expo-notifications`) — no push
  server setup is needed for them to work; toggle them from the Account tab, which
  will prompt for OS notification permission the first time.
- Run `npx expo install --fix` once after cloning to double check every Expo/React
  Native package version is exactly what this Expo SDK expects — that check couldn't
  run in the sandbox this was built in (see `docs/PROGRESS.md`).

## 4. AI Q&A edge function

```bash
supabase functions deploy ask-ai
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

## Note on the prayer time data

The prayer times were transcribed from the "IQRA Tutorial Hub" table calendar PDF you
shared (12 monthly tables, Fajr/Sunrise/Zohr/Asr/Maghrib/Isha).

- **Location**: this is a single **nationwide Nepal** schedule, not a specific city —
  the seeded `locations` row is named "Nepal" with a representative center point
  (Kathmandu) rather than GPS coordinates that matter for lookup.
- **Adhan vs. Jamat**: the calendar's times are **Adhan** (start-of-window) times —
  the same for everyone in Nepal, stored in `prayer_times`. Each masjid separately sets
  its own **Jamat** (congregation) time per prayer — often a few minutes after Adhan —
  in the new `masjids.fajr_jamat` / `dhuhr_jamat` / `asr_jamat` / `maghrib_jamat` /
  `isha_jamat` / `jumma_jamat` columns, editable per-masjid from the admin dashboard's
  Masjids page. The mobile app's Prayer Times tab shows Adhan times; the Nearby tab
  shows each masjid's Jamat times.
- **Year-agnostic storage**: times are stored by `(month, day)`, not a specific year,
  since the same printed national calendar is normally reused every year with only
  sub-minute drift. February had 29 rows in the source (a leap year), so Feb 29 is
  stored too — the app falls back to Feb 28 in non-leap years (see
  `mobile/lib/prayerLogic.ts`).
- A copy of the raw transcribed data (before SQL conversion) is at
  `docs/prayer_times_raw.json` for reference/auditing.
