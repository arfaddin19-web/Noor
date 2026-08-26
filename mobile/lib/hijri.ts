/** Gregorian ⇄ Hijri conversion (tabular/civil Islamic calendar — the same
 *  kind of arithmetic calendar used by "Kuwaiti algorithm" implementations
 *  elsewhere). Good for display and planning purposes; the *actual* start of
 *  a Hijri month is set by local moon sighting and can differ by a day from
 *  what any tabular calendar predicts — screens using this should say so.
 *
 *  Both directions go through a shared Julian Day Number, and are verified
 *  to round-trip exactly (see the fuzz test this was built against) — no
 *  separate hand-derived formulas that could quietly disagree with each other. */

export const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi' al-awwal", "Rabi' al-thani",
  "Jumada al-awwal", "Jumada al-thani", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah",
];

const ISLAMIC_EPOCH_JD = 1948440; // JD of 1 Muharram, 1 AH (civil/tabular epoch)

/** Fliegel & Van Flandern's Gregorian-date-to-JD algorithm. `Math.trunc` (not
 *  `Math.floor`) is required for the `(month - 14) / 12` term — the original
 *  formula assumes C-style truncating integer division, which only differs
 *  from floor for January/February; using floor there is a classic porting
 *  bug that silently shifts the whole result by up to 2 days in Jan/Feb. */
function gregorianToJD(year: number, month: number, day: number): number {
  const a = Math.trunc((month - 14) / 12);
  return (
    Math.floor((1461 * (year + 4800 + a)) / 4) +
    Math.floor((367 * (month - 2 - 12 * a)) / 12) -
    Math.floor((3 * Math.floor((year + 4900 + a) / 100)) / 4) +
    day -
    32075
  );
}

function jdToGregorian(jd: number): { year: number; month: number; day: number } {
  let l = jd + 68569;
  const n = Math.floor((4 * l) / 146097);
  l = l - Math.floor((146097 * n + 3) / 4);
  const i = Math.floor((4000 * (l + 1)) / 1461001);
  l = l - Math.floor((1461 * i) / 4) + 31;
  const j = Math.floor((80 * l) / 2447);
  const day = l - Math.floor((2447 * j) / 80);
  l = Math.floor(j / 11);
  const month = j + 2 - 12 * l;
  const year = 100 * (n - 49) + i + l;
  return { year, month, day };
}

function islamicToJD(year: number, month: number, day: number): number {
  return (
    day +
    Math.ceil(29.5 * (month - 1)) +
    (year - 1) * 354 +
    Math.floor((3 + 11 * year) / 30) +
    ISLAMIC_EPOCH_JD -
    1
  );
}

function jdToIslamic(jd: number): { year: number; month: number; day: number } {
  jd = Math.floor(jd);
  const year = Math.floor((30 * (jd - ISLAMIC_EPOCH_JD) + 10646) / 10631);
  const month = Math.max(1, Math.min(12, Math.ceil((jd - (29 + islamicToJD(year, 1, 1))) / 29.5) + 1));
  const day = jd - islamicToJD(year, month, 1) + 1;
  return { year, month, day };
}

export function gregorianToHijri(date: Date): { year: number; month: number; day: number } {
  const jd = gregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return jdToIslamic(jd);
}

export function formatHijri(date: Date): string {
  const { year, month, day } = gregorianToHijri(date);
  const name = HIJRI_MONTHS[Math.max(0, Math.min(11, month - 1))];
  return `${day} ${name} ${year}`;
}

/** The inverse of gregorianToHijri — e.g. "when does Ramadan start this
 *  Hijri year." Shares the same Julian-day midpoint as the forward
 *  conversion, so the two are guaranteed to round-trip exactly. */
export function hijriToGregorian(hijriYear: number, hijriMonth: number, hijriDay: number): Date {
  const jd = islamicToJD(hijriYear, hijriMonth, hijriDay);
  const g = jdToGregorian(jd);
  return new Date(g.year, g.month - 1, g.day);
}
