/** A curated list of well-known, meaningful standalone verses — curated so the
 *  daily pick always reads sensibly on its own (many verses only make sense
 *  as part of a longer passage, so we don't pick at random from the whole
 *  Qur'an). Deterministic by day-of-year, so it's stable for the whole day
 *  without needing a backend. */
export interface AyahRef {
  surah: number;
  ayah: number;
}

export const AYAH_OF_DAY_REFS: AyahRef[] = [
  { surah: 2, ayah: 152 }, // "So remember Me; I will remember you"
  { surah: 2, ayah: 186 }, // "I am near"
  { surah: 2, ayah: 255 }, // Ayat al-Kursi
  { surah: 2, ayah: 286 }, // "Allah does not burden a soul beyond what it can bear"
  { surah: 3, ayah: 26 }, // "Say, O Allah, Owner of Sovereignty..."
  { surah: 3, ayah: 159 }, // Gentleness and consultation
  { surah: 3, ayah: 190 }, // Signs in the heavens and earth
  { surah: 6, ayah: 162 }, // "My prayer, my rites of sacrifice..."
  { surah: 9, ayah: 51 }, // "Nothing will befall us except what Allah has decreed"
  { surah: 13, ayah: 28 }, // Hearts find rest in remembrance of Allah
  { surah: 14, ayah: 7 }, // "If you are grateful, I will surely increase you"
  { surah: 16, ayah: 97 }, // Good life for righteous believers
  { surah: 17, ayah: 23 }, // Kindness to parents
  { surah: 20, ayah: 114 }, // "My Lord, increase me in knowledge"
  { surah: 24, ayah: 35 }, // Ayat an-Nur — "Allah is the Light..."
  { surah: 29, ayah: 45 }, // Prayer prevents immorality
  { surah: 31, ayah: 17 }, // "Establish prayer, enjoin good, forbid wrong"
  { surah: 39, ayah: 53 }, // "Do not despair of the mercy of Allah"
  { surah: 41, ayah: 30 }, // Angels descend on those who say "Our Lord is Allah"
  { surah: 49, ayah: 13 }, // Mankind created into nations and tribes
  { surah: 55, ayah: 13 }, // "Which of the favors of your Lord will you deny?"
  { surah: 57, ayah: 4 }, // "He is with you wherever you are"
  { surah: 65, ayah: 3 }, // "Whoever relies upon Allah — He is sufficient for him"
  { surah: 94, ayah: 5 }, // "Indeed, with hardship comes ease"
  { surah: 112, ayah: 1 }, // "Say, He is Allah, the One"
];

export function getTodayAyahRef(date = new Date()): AyahRef {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return AYAH_OF_DAY_REFS[dayOfYear % AYAH_OF_DAY_REFS.length];
}
