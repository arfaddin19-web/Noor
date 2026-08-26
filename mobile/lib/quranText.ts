import versesRaw from "../assets/quran/verses.json";
import surahNamesRaw from "../assets/quran/surahNames.json";

/** The Qur'an's Arabic text, bundled locally instead of fetched from
 *  api.alquran.cloud's "quran-uthmani" edition. That edition is Tanzil's
 *  generic Uthmani Unicode text, which uses different codepoints for the
 *  small diacritic/waqf marks than the KFGQPC Uthmanic Hafs font expects —
 *  rendering it in that font produced broken glyphs (stray black circles
 *  replacing letters) instead of the font's intended decorative ayah-end
 *  ornaments. This dataset is the QPC v18-matched text (from
 *  github.com/thetruetruth/quran-data-kfgqpc, itself sourced from King Fahd
 *  Complex's own Uthmani Hafs text release), verified to render cleanly with
 *  UthmanicHafs-Regular. Bundling it locally also means the Arabic text no
 *  longer depends on a network call at all. */

interface VerseTuple {
  0: number; // surah number
  1: number; // ayah number within surah
  2: number; // Mushaf page number (1-604)
  3: number; // Juz number (1-30)
  4: string; // Arabic text (QPC Uthmani Hafs encoding)
}

const verses = versesRaw as unknown as VerseTuple[];

export interface SurahName {
  number: number;
  name: string; // Arabic
  englishName: string;
}

export const SURAH_NAMES: SurahName[] = surahNamesRaw as SurahName[];

const surahNameByNumber = new Map(SURAH_NAMES.map((s) => [s.number, s]));

export interface QuranVerse {
  numberInSurah: number;
  text: string;
  surah: { number: number; englishName: string; name: string };
}

function toVerse(v: VerseTuple): QuranVerse {
  const surah = surahNameByNumber.get(v[0]);
  return {
    numberInSurah: v[1],
    text: v[4],
    surah: { number: v[0], englishName: surah?.englishName ?? "", name: surah?.name ?? "" },
  };
}

export function getSurahAyahs(surahNumber: number): QuranVerse[] {
  return verses.filter((v) => v[0] === surahNumber).map(toVerse);
}

export function getJuzAyahs(juzNumber: number): QuranVerse[] {
  return verses.filter((v) => v[3] === juzNumber).map(toVerse);
}

export function getPageAyahs(pageNumber: number): QuranVerse[] {
  return verses.filter((v) => v[2] === pageNumber).map(toVerse);
}

export function getAyahText(surahNumber: number, ayahNumber: number): string | undefined {
  return verses.find((v) => v[0] === surahNumber && v[1] === ayahNumber)?.[4];
}
