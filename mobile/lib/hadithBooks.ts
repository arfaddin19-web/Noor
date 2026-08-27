export interface HadithBook {
  key: string;
  name: string;
  /** fawazahmed0/hadith-api edition slugs. Undefined where the language isn't published. */
  editionEn?: string;
  editionUr?: string;
  available: boolean;
  /** Shown instead of content when `available` is false — explains honestly why,
   *  rather than fabricating text for a collection we don't have a verified source for. */
  unavailableNote?: string;
}

// Real, verified editions from https://github.com/fawazahmed0/hadith-api (checked
// against its editions list). Hindi and Nepali translations are not published by
// this (or any free) source we could find, so Urdu is offered as the closest
// available alternative-language reading.
export const HADITH_BOOKS: HadithBook[] = [
  {
    key: "bukhari",
    name: "Sahih al-Bukhari",
    editionEn: "eng-bukhari",
    editionUr: "urd-bukhari",
    available: true,
  },
  {
    key: "muslim",
    name: "Sahih Muslim",
    editionEn: "eng-muslim",
    editionUr: "urd-muslim",
    available: true,
  },
  {
    key: "abudawud",
    name: "Sunan Abu Dawud",
    editionEn: "eng-abudawud",
    editionUr: "urd-abudawud",
    available: true,
  },
  {
    key: "tirmidhi",
    name: "Jami' at-Tirmidhi",
    editionEn: "eng-tirmidhi",
    editionUr: "urd-tirmidhi",
    available: true,
  },
  {
    key: "nasai",
    name: "Sunan an-Nasa'i",
    editionEn: "eng-nasai",
    editionUr: "urd-nasai",
    available: true,
  },
  {
    key: "ibnmajah",
    name: "Sunan Ibn Majah",
    editionEn: "eng-ibnmajah",
    editionUr: "urd-ibnmajah",
    available: true,
  },
  {
    key: "muntakhab",
    name: "Muntakhab Ahadith",
    available: true,
    // Not extracted to text like the others — shown as scanned page images
    // instead (see lib/muntakhabAhadithPages.ts and the note at the top of
    // MuntakhabAhadithScreen.tsx for why). BooksHadithScreen routes this key
    // to its own screen instead of the generic HadithBook reader.
  },
  {
    key: "bahishti",
    name: "Bahishti Zewar",
    available: true,
    // Not a fetched hadith-API collection like the others above — this is a
    // locally bundled, chapter-split translation (see lib/bahishtiZewar.ts).
    // BooksHadithScreen routes this key to its own screen instead of the
    // generic HadithBook reader.
  },
];
