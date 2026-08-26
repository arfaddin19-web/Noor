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

export function parseTimeToday(time: string, base: Date): Date {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

/** Has this prayer's Adhan time already happened today? Used to stop the
 *  Today's Progress checklist from letting someone mark a prayer as prayed
 *  before its time has even arrived. */
export function hasPrayerTimeArrived(
  today: PrayerTime,
  key: keyof PrayerTime,
  now = new Date()
): boolean {
  const t = parseTimeToday(today[key] as string, now);
  return t.getTime() <= now.getTime();
}

export interface NextPrayer {
  label: string;
  time: Date;
  msRemaining: number;
}

export interface CurrentPrayer {
  label: string;
  time: Date;
}

/**
 * The salah whose window we're currently in — i.e. the most recent prayer time
 * that has already passed today. Returns null before today's Fajr (in which case
 * the current window technically belongs to last night's Isha, which we don't
 * have loaded here — callers should show a neutral placeholder in that case).
 */
export function getCurrentPrayer(today: PrayerTime, now = new Date()): CurrentPrayer | null {
  const salahKeys = PRAYER_LABELS.filter((p) => p.key !== "sunrise");
  let current: CurrentPrayer | null = null;
  for (const { key, label } of salahKeys) {
    const t = parseTimeToday(today[key] as string, now);
    if (t.getTime() <= now.getTime()) {
      current = { label, time: t };
    }
  }
  return current;
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
