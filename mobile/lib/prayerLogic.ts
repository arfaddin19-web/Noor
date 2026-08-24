import { PrayerTime, PRAYER_LABELS } from "./types";

/** Days in month for a given (possibly non-leap) year — used to fall back Feb 29 -> Feb 28. */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Which (month, day) row to look up for "today", handling the Feb 29 fallback. */
export function todayMonthDay(now = new Date()): { month: number; day: number } {
  const month = now.getMonth() + 1;
  let day = now.getDate();
  const maxDay = daysInMonth(now.getFullYear(), month);
  if (day > maxDay) day = maxDay; // shouldn't happen, but guards against bad data
  return { month, day };
}

function parseTimeToday(time: string, base: Date): Date {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

export interface NextPrayer {
  label: string;
  time: Date;
  msRemaining: number;
}

/**
 * Given today's row and tomorrow's row (for the after-Isha case), find the next
 * upcoming prayer (Fajr, Dhuhr, Asr, Maghrib, or Isha — sunrise is informational only).
 */
export function getNextPrayer(
  today: PrayerTime,
  tomorrow: PrayerTime | null,
  now = new Date()
): NextPrayer | null {
  const salahKeys = PRAYER_LABELS.filter((p) => p.key !== "sunrise");

  for (const { key, label } of salahKeys) {
    const t = parseTimeToday(today[key] as string, now);
    if (t.getTime() > now.getTime()) {
      return { label, time: t, msRemaining: t.getTime() - now.getTime() };
    }
  }

  // All of today's prayers have passed — next one is tomorrow's Fajr.
  if (tomorrow) {
    const tmrw = new Date(now);
    tmrw.setDate(tmrw.getDate() + 1);
    const t = parseTimeToday(tomorrow.fajr, tmrw);
    return { label: "Fajr", time: t, msRemaining: t.getTime() - now.getTime() };
  }

  return null;
}

export function formatCountdown(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
