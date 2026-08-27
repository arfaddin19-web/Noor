-- Scanned book pages (e.g. Muntakhab Ahadith), hosted in Supabase Storage
-- instead of bundled into the app. This replaces the earlier approach of
-- shipping page images inside the app bundle, which added ~40MB to the app
-- for one book alone. More scanned books are planned, so this is built as a
-- reusable, generic system: any book's pages just need to be uploaded once
-- (see admin/scripts/upload-book-pages.js) and a row added here — no app
-- code changes needed for future books.

-- Public bucket: page images are not sensitive, and serving them via the
-- public URL means the app doesn't need to authenticate to read pages, and
-- no "storage.objects" RLS policy is needed for reads.
insert into storage.buckets (id, name, public)
values ('book-pages', 'book-pages', true)
on conflict (id) do nothing;

create table if not exists public.scanned_books (
  slug text primary key,
  title text not null,
  description text,
  page_count integer not null,
  created_at timestamptz not null default now()
);

alter table public.scanned_books enable row level security;

-- Everyone (including anonymous users) can read the list of scanned books.
-- Only the service role (used by the upload script, which bypasses RLS
-- entirely) can write, so no insert/update policy is defined.
drop policy if exists "scanned_books_public_read" on public.scanned_books;
create policy "scanned_books_public_read"
  on public.scanned_books for select
  using (true);

grant select on public.scanned_books to anon, authenticated;

-- Seed the Muntakhab Ahadith row. page_count matches the 350 page images
-- already generated from the source PDF (see docs/PROGRESS.md). The actual
-- images still need to be uploaded once via admin/scripts/upload-book-pages.js
-- from the local mobile/assets/muntakhabAhadith/pages/ folder.
insert into public.scanned_books (slug, title, description, page_count)
values (
  'muntakhab-ahadith',
  'Muntakhab Ahadith',
  'Shown as scanned page images — the source PDF interleaves Arabic and English too tightly per-hadith for reliable text extraction.',
  350
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  page_count = excluded.page_count;
