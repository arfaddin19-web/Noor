#!/usr/bin/env node
/**
 * Uploads a scanned book's page images to Supabase Storage and registers
 * (or updates) its row in the `scanned_books` table, so the app can show it
 * via the generic ScannedBookScreen without any app code changes.
 *
 * This is a ONE-TIME (or one-time-per-book) script you run yourself from
 * your computer. It does not run automatically and is not part of the app.
 *
 * ---------------------------------------------------------------------
 * HOW TO RUN THIS (Windows Command Prompt)
 * ---------------------------------------------------------------------
 * 1. Get your Supabase SERVICE ROLE key (different from the "anon" key
 *    already in the app):
 *      - Open https://supabase.com/dashboard
 *      - Open the Noor project
 *      - Settings (gear icon, bottom left) -> API
 *      - Under "Project API keys", copy the "service_role" key (click the
 *        eye icon to reveal it, then copy). Keep this secret — never share
 *        it or paste it anywhere public. It's only used here, once, from
 *        your own computer.
 *
 * 2. Open Command Prompt, go into the admin folder, e.g.:
 *      cd C:\Users\<you>\Downloads\Noor\admin
 *
 * 3. Make sure dependencies are installed (only needed once):
 *      npm install
 *
 * 4. Run the script, pasting your service role key in place of
 *    YOUR_SERVICE_ROLE_KEY, and adjusting the folder path if needed:
 *
 *      set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
 *      node scripts\upload-book-pages.js --slug muntakhab-ahadith --title "Muntakhab Ahadith" --folder ..\mobile\assets\muntakhabAhadith\pages
 *
 *    This uploads every page-*.jpg in that folder to Supabase Storage under
 *    book-pages/muntakhab-ahadith/, and creates/updates the matching row in
 *    the scanned_books table. It only needs to be run once per book — after
 *    that the app fetches pages straight from Supabase, nothing further to
 *    do. Re-running it is safe (it just re-uploads/overwrites).
 *
 * For a FUTURE book, run the same command with a different --slug, --title,
 * and --folder pointing at that book's page images — no other changes
 * needed anywhere.
 * ---------------------------------------------------------------------
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const value = argv[i + 1];
      args[key] = value;
      i++;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const slug = args.slug;
  const title = args.title;
  const description = args.description || null;
  const folder = args.folder;

  if (!slug || !title || !folder) {
    console.error(
      "Usage: node scripts/upload-book-pages.js --slug <slug> --title \"<Title>\" --folder <path-to-page-images> [--description \"<text>\"]"
    );
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://njivttoglciffuwqjefd.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Set it first, e.g.:\n  set SUPABASE_SERVICE_ROLE_KEY=your_key_here\nSee the instructions at the top of this file for where to find it."
    );
    process.exit(1);
  }

  const folderPath = path.resolve(folder);
  if (!fs.existsSync(folderPath)) {
    console.error(`Folder not found: ${folderPath}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(folderPath)
    .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
    .sort();

  if (files.length === 0) {
    console.error(`No image files found in ${folderPath}`);
    process.exit(1);
  }

  console.log(`Found ${files.length} page images in ${folderPath}`);

  const supabase = createClient(supabaseUrl, serviceKey);

  console.log(`Uploading to storage bucket "book-pages/${slug}/" ...`);
  let uploaded = 0;
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const fileBuffer = fs.readFileSync(filePath);
    const contentType = file.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
    const { error } = await supabase.storage
      .from("book-pages")
      .upload(`${slug}/${file}`, fileBuffer, {
        contentType,
        upsert: true,
      });
    if (error) {
      console.error(`Failed to upload ${file}:`, error.message);
      process.exit(1);
    }
    uploaded++;
    if (uploaded % 25 === 0 || uploaded === files.length) {
      console.log(`  ${uploaded}/${files.length} uploaded...`);
    }
  }

  console.log(`Registering "${slug}" in scanned_books (page_count=${files.length})...`);
  const { error: dbError } = await supabase.from("scanned_books").upsert({
    slug,
    title,
    description,
    page_count: files.length,
  });
  if (dbError) {
    console.error("Failed to upsert scanned_books row:", dbError.message);
    process.exit(1);
  }

  console.log("Done! The book is now available in the app under Books & Hadith.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
