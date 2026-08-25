/** Approximate Gregorian → Hijri conversion (tabular Islamic calendar algorithm).
 *  Good for display purposes (±1 day of the moon-sighting-based date some regions
 *  use officially) — not authoritative for determining Ramadan/Eid dates. */

const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi' al-awwal", "Rabi' al-thani",
  "Jumada al-awwal", "Jumada al-thani", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah",
];

function gregorianToJD(y: number, m: number, d: number): number {
  return (
    Math.floor((1461 * (y + 4800 + Math.floor((m - 14) / 12))) / 4) +
    Math.floor((367 * (m - 2 - 12 * Math.floor((m - 14) / 12))) / 12) -
    Math.floor((3 * Math.floor((y + 4900 + Math.floor((m - 14) / 12)) / 100)) / 4) +
    d -
    32075
  );
}

export function gregorianToHijri(date: Date): { year: number; month: number; day: number } {
  let jd = gregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate());
  jd = jd - 1948440 + 10632;
  const n = Math.floor((jd - 1) / 10631);
  jd = jd - 10631 * n + 354;
  const j =
    Math.floor((10985 - jd) / 5316) * Math.floor((50 * jd) / 17719) +
    Math.floor(jd / 5670) * Math.floor((43 * jd) / 15238);
  jd =
    jd -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * jd) / 709);
  const day = jd - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { year, month, day };
}

export function formatHijri(date: Date): string {
  const { year, month, day } = gregorianToHijri(date);
  const name = HIJRI_MONTHS[Math.max(0, Math.min(11, month - 1))];
  return `${day} ${name} ${year}`;
}
