/** A curated set of short, widely-known, authentically-sourced hadith — kept
 *  local/offline (no API dependency, since this needs to be baked into
 *  scheduled notifications ahead of time, not fetched at delivery time).
 *  Deliberately limited to hadith we're confident are accurately sourced,
 *  rather than padding the list with anything popular but weakly attributed. */
export interface HadithOfDayEntry {
  text: string;
  reference: string;
}

export const HADITH_OF_DAY: HadithOfDayEntry[] = [
  { text: "Actions are judged by intentions, and every person will get what they intended.", reference: "Bukhari, Muslim" },
  { text: "None of you truly believes until he loves for his brother what he loves for himself.", reference: "Bukhari, Muslim" },
  { text: "The strong person is not the one who overcomes others by his strength, but the one who controls himself in anger.", reference: "Bukhari, Muslim" },
  { text: "Whoever believes in Allah and the Last Day should speak good or remain silent.", reference: "Bukhari, Muslim" },
  { text: "Modesty brings nothing except good.", reference: "Muslim" },
  { text: "The most beloved deeds to Allah are those done consistently, even if small.", reference: "Bukhari, Muslim" },
  { text: "None of you will enter Paradise by his deeds alone — not even the Prophet ﷺ, except that Allah covers him with His grace and mercy.", reference: "Bukhari, Muslim" },
  { text: "Whoever relieves a believer's distress in this world, Allah will relieve his distress on the Day of Judgment.", reference: "Muslim" },
  { text: "The best among you are those who learn the Qur'an and teach it.", reference: "Bukhari" },
  { text: "A good word is charity.", reference: "Bukhari, Muslim" },
  { text: "Smiling at your brother is charity.", reference: "Tirmidhi" },
  { text: "The best of you are those who are best to their families.", reference: "Tirmidhi, Ibn Majah" },
  { text: "Whoever does not thank people has not thanked Allah.", reference: "Abu Dawud, Tirmidhi" },
  { text: "Whoever guides someone to goodness has a reward like the one who acted on it.", reference: "Muslim" },
  { text: "Cleanliness is half of faith.", reference: "Muslim" },
  { text: "The upper (giving) hand is better than the lower (receiving) hand.", reference: "Bukhari, Muslim" },
  { text: "Whoever does not show mercy to others will not be shown mercy.", reference: "Bukhari, Muslim" },
  { text: "When a person dies, their deeds come to an end except for three: ongoing charity, beneficial knowledge, or a righteous child who prays for them.", reference: "Muslim" },
  { text: "The most complete of the believers in faith are those with the best character.", reference: "Abu Dawud, Tirmidhi" },
  { text: "Deeds are judged by how they end.", reference: "Bukhari" },
  { text: "Whoever believes in Allah and the Last Day should honor his guest.", reference: "Bukhari, Muslim" },
  { text: "Truthfulness leads to righteousness, and righteousness leads to Paradise.", reference: "Bukhari, Muslim" },
  { text: "Whoever believes in Allah and the Last Day should not harm his neighbor.", reference: "Bukhari, Muslim" },
  { text: "Seeking knowledge is an obligation upon every Muslim.", reference: "Ibn Majah" },
];

export function getHadithForDate(date = new Date()): HadithOfDayEntry {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return HADITH_OF_DAY[dayOfYear % HADITH_OF_DAY.length];
}
