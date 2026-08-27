import Constants from "expo-constants";
import { supabase } from "./supabase";

/** A book shown as scanned page images (hosted in Supabase Storage) rather
 *  than extracted text — for source PDFs where Arabic/English are too
 *  tightly interleaved per-hadith for reliable text extraction. New books
 *  of this kind need no app code changes: just run
 *  admin/scripts/upload-book-pages.js and they show up here automatically. */
export interface ScannedBook {
  slug: string;
  title: string;
  description: string | null;
  page_count: number;
}

export async function getScannedBooks(): Promise<ScannedBook[]> {
  const { data } = await supabase
    .from("scanned_books")
    .select("*")
    .order("created_at", { ascending: true });
  return (data as ScannedBook[]) ?? [];
}

const { supabaseUrl } = (Constants.expoConfig?.extra ?? {}) as { supabaseUrl?: string };

/** Public Storage URL for one page of a scanned book. Pages are expected to
 *  be named page-001.jpg, page-002.jpg, ... (3-digit, 1-based) — matching
 *  what upload-book-pages.js uploads them as. */
export function scannedBookPageUrl(slug: string, pageNumber: number): string {
  const padded = String(pageNumber).padStart(3, "0");
  return `${supabaseUrl}/storage/v1/object/public/book-pages/${slug}/page-${padded}.jpg`;
}
