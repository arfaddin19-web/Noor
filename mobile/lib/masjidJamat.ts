import { supabase } from "./supabase";
import { todayMonthDay, parseTimeToday } from "./prayerLogic";
import { Masjid } from "./types";

/** One day's row from a masjid's yearly Jamat calendar (see
 *  admin/components/JamatCalendarUpload.tsx for how it gets populated) —
 *  null if that masjid hasn't uploaded one yet, in which case callers should
 *  fall back to the masjid's fixed *_jamat columns, same as before this
 *  table existed. */
export interface TodayJamat {
  fajr: string | null;
  dhuhr: string | null;
  asr: string | null;
  maghrib: string | null;
  isha: string | null;
  jumma: string | null;
}

// Postgres `time` columns come back as "HH:MM:SS" — trim to "HH:MM" to match
// the plain-text format the rest of the app already displays.
function trimSeconds(t: string | null): string | null {
  return t ? t.slice(0, 5) : null;
}

export async function getJamatForDate(masjidId: string, date: Date): Promise<TodayJamat | null> {
  const { month, day } = todayMonthDay(date);
  const { data } = await supabase
    .from("masjid_jamat_times")
    .select("fajr,dhuhr,asr,maghrib,isha,jumma")
    .eq("masjid_id", masjidId)
    .eq("month", month)
    .eq("day", day)
    .maybeSingle();
  if (!data) return null;
  return {
    fajr: trimSeconds(data.fajr),
    dhuhr: trimSeconds(data.dhuhr),
    asr: trimSeconds(data.asr),
    maghrib: trimSeconds(data.maghrib),
    isha: trimSeconds(data.isha),
    jumma: trimSeconds(data.jumma),
  };
}

export function getTodayJamat(masjidId: string): Promise<TodayJamat | null> {
  return getJamatForDate(masjidId, new Date());
}

const JAMAT_ORDER: { label: string; key: keyof TodayJamat; flatKey: keyof Masjid }[] = [
  { label: "Fajr", key: "fajr", flatKey: "fajr_jamat" },
  { label: "Dhuhr", key: "dhuhr", flatKey: "dhuhr_jamat" },
  { label: "Asr", key: "asr", flatKey: "asr_jamat" },
  { label: "Maghrib", key: "maghrib", flatKey: "maghrib_jamat" },
  { label: "Isha", key: "isha", flatKey: "isha_jamat" },
];

export interface NextJamat {
  label: string;
  time: string;
}

/** The next Jamat congregation actually about to happen — not just the next
 *  prayer *window* (getNextPrayer, Adhan-based). A masjid's Jamat for the
 *  prayer we're currently "in" (e.g. Dhuhr's window) may not have happened
 *  yet, in which case that's what should show — not Asr's, even though Asr
 *  is technically the next Adhan. Walks today's Jamat times in order and
 *  returns the first one still ahead of `now`; unset prayers are skipped
 *  (not treated as "already passed"). Falls back to tomorrow's Fajr Jamat if
 *  every one of today's has passed. */
export function getNextJamat(params: {
  today: TodayJamat | null;
  tomorrow: TodayJamat | null;
  masjid: Masjid;
  now?: Date;
}): NextJamat | null {
  const { today, tomorrow, masjid, now = new Date() } = params;

  for (const { label, key, flatKey } of JAMAT_ORDER) {
    const value = today?.[key] ?? (masjid[flatKey] as string | null);
    if (!value) continue;
    const t = parseTimeToday(value, now);
    if (t.getTime() > now.getTime()) return { label, time: value };
  }

  // Every Jamat we know about today has passed (or none are set) — the next
  // one is tomorrow's Fajr.
  const tomorrowFajr = tomorrow?.fajr ?? (masjid.fajr_jamat as string | null);
  return tomorrowFajr ? { label: "Fajr", time: tomorrowFajr } : null;
}
