import chaptersRaw from "../assets/bahishtiZewar/chapters.json";

/** Bahishti Zewar (English) — Maulana Ashraf Ali Thanwi's classic Hanafi fiqh
 *  manual, translated by Maulana Muhammad Mahomedy (Zam Zam Publishers,
 *  2nd ed. 2005). Extracted from the user-supplied PDF (a public-domain-era
 *  scan hosted on archive.org) via its OCR text layer, then split into
 *  chapters here using the book's own bold section headings as split
 *  points, discarding running headers/footers and the front-matter table of
 *  contents.
 *
 *  Caveats, honestly: this is OCR'd text from a scan, not a clean digital
 *  edition — occasional word-order glitches from the original's two-column
 *  page layout are possible, and a handful of chapter titles have minor OCR
 *  artifacts (e.g. a stray apostrophe read as a space). The content itself
 *  wasn't altered or re-translated. Nepali/Hindi translation is a separate,
 *  not-yet-started follow-on — see PROGRESS.md for why that needs a
 *  scholar's review before being shown as authoritative (this is a fiqh
 *  manual, where precision in rulings matters). */

export interface BzChapter {
  id: number;
  title: string;
  text: string;
}

export const BZ_CHAPTERS: BzChapter[] = chaptersRaw as BzChapter[];

export function getBzChapter(id: number): BzChapter | undefined {
  return BZ_CHAPTERS.find((c) => c.id === id);
}
