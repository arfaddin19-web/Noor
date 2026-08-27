import { supabase } from "./supabase";
import { todayMonthDay } from "./prayerLogic";

/** Today's row from a masjid's yearly Jamat calendar (see
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

export async function getTodayJamat(masjidId: string): Promise<TodayJamat | null> {
  const { month, day } = todayMonthDay();
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
