# Setup

## 1. Create a Supabase project

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor (or via the Supabase CLI), run the migrations in
   `supabase/migrations/` **in order**:
   - `0001_init.sql` — tables
   - `0002_rls.sql` — row-level security policies
   - `0003_seed_prayer_times.sql` — seeds one default location ("Bhairahawa, Nepal" —
     please confirm/correct this, see note below) with a full year of prayer times
     transcribed from the IQRA Tutorial Hub table calendar you shared.

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

## 4. AI Q&A edge function

```bash
supabase functions deploy ask-ai
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

## Note on the prayer time data

The prayer times were transcribed from the "IQRA Tutorial Hub" table calendar PDF you
shared (12 monthly tables, Fajr/Sunrise/Zohr/Asr/Maghrib/Isha). The PDF itself didn't
state a city or year, so:

- **Location**: guessed as **Bhairahawa, Nepal** from the calendar's `061` phone area
  code (Bhairahawa/Siddharthanagar, Rupandehi district). **Please confirm or correct**
  the name/coordinates in the `locations` table (or via the admin dashboard once it's
  running).
- **Year-agnostic storage**: times are stored by `(month, day)`, not a specific year,
  since the same printed local calendar is normally reused every year with only
  sub-minute drift. February had 29 rows in the source (a leap year), so Feb 29 is
  stored too — the app should fall back to Feb 28 in non-leap years (see
  `mobile/lib/prayerLogic.ts`).
- A copy of the raw transcribed data (before SQL conversion) is at
  `docs/prayer_times_raw.json` for reference/auditing.
