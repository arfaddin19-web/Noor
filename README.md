# Noor — Muslim Companion App

A Muslim lifestyle app: prayer times, Qibla direction, Quran, Hadith,
nearby masjids, nearby halal food, and an AI-powered Islamic Q&A assistant.

## Monorepo layout

```
noor/
├─ mobile/       React Native (Expo) app — the end-user mobile app
├─ admin/        Next.js admin web dashboard — content management
├─ supabase/     Database schema, migrations, seed data, edge functions
└─ docs/         Architecture notes, API contracts, data sources
```

## Stack

- **Backend/DB:** [Supabase](https://supabase.com) (Postgres + Auth + Storage + Edge Functions)
- **Mobile app:** React Native + Expo
- **Admin dashboard:** Next.js + Supabase JS client
- **AI Q&A:** Claude (Anthropic API) via a Supabase Edge Function
- **Quran/Hadith content:** fetched from free open APIs (AlQuran Cloud / Quran.com, Hadith APIs) at runtime

## Getting started

See `docs/SETUP.md` for environment setup (Supabase project, env vars, running each app).

## Status

🚧 Early scaffolding — see `docs/PROGRESS.md` for what's built so far.
