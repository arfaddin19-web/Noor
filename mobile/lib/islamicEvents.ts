import { gregorianToHijri, hijriToGregorian } from "./hijri";

export interface IslamicEvent {
  title: string;
  hijriMonth: number;
  hijriDay: number;
  date: Date;
  note?: string;
}

// Standard tabular-calendar dates for widely observed occasions. These are
// *estimates* — the real start of a Hijri month is set by local moon
// sighting and can land a day earlier or later than a tabular calendar
// predicts, which is why every screen that uses this says so.
const EVENT_DEFS: { title: string; month: number; day: number; note?: string }[] = [
  { title: "Islamic New Year", month: 1, day: 1 },
  { title: "Ashura", month: 1, day: 10 },
  { title: "Mawlid al-Nabi", month: 3, day: 12, note: "Commonly observed date" },
  { title: "Isra and Mi'raj", month: 7, day: 27, note: "Traditionally observed date" },
  { title: "Start of Ramadan", month: 9, day: 1 },
  {
    title: "Laylatul Qadr",
    month: 9,
    day: 27,
    note: "Most commonly observed night — could be any odd night in the last 10 of Ramadan",
  },
  { title: "Eid al-Fitr", month: 10, day: 1 },
  { title: "Start of Dhu al-Hijjah", month: 12, day: 1, note: "First 10 days are especially virtuous" },
  { title: "Day of Arafah", month: 12, day: 9 },
  { title: "Eid al-Adha", month: 12, day: 10 },
];

export function getIslamicEvents(hijriYear: number): IslamicEvent[] {
  return EVENT_DEFS.map((e) => ({
    title: e.title,
    hijriMonth: e.month,
    hijriDay: e.day,
    date: hijriToGregorian(hijriYear, e.month, e.day),
    note: e.note,
  })).sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** The Hijri year whose Ramadan is either current or next upcoming — i.e. if
 *  we're past this year's Ramadan already, roll forward to next year's. */
export function getRelevantRamadanYear(now = new Date()): number {
  const h = gregorianToHijri(now);
  return h.month > 9 ? h.year + 1 : h.year;
}

export function getRamadanRange(hijriYear: number): { start: Date; end: Date } {
  const start = hijriToGregorian(hijriYear, 9, 1);
  const shawwalStart = hijriToGregorian(hijriYear, 10, 1);
  const end = new Date(shawwalStart.getTime() - 86_400_000);
  return { start, end };
}
