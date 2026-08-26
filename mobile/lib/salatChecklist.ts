import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIX = "noor.salat."; // + ISO date

export type SalatKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export type SalatChecklist = Record<SalatKey, boolean>;

export const SALAT_ORDER: { key: SalatKey; label: string }[] = [
  { key: "fajr", label: "Fajr" },
  { key: "dhuhr", label: "Dhuhr" },
  { key: "asr", label: "Asr" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isha", label: "Isha" },
];

const EMPTY: SalatChecklist = {
  fajr: false,
  dhuhr: false,
  asr: false,
  maghrib: false,
  isha: false,
};

function todayKey(): string {
  return PREFIX + new Date().toISOString().slice(0, 10);
}

/** A user-marked "I prayed this today" checklist — real, tappable, local to the
 *  device. Not derived from anything automatic, so it's honest about what it is. */
export async function getTodaySalatChecklist(): Promise<SalatChecklist> {
  const raw = await AsyncStorage.getItem(todayKey());
  if (!raw) return { ...EMPTY };
  try {
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY };
  }
}

export async function toggleSalat(key: SalatKey): Promise<SalatChecklist> {
  const current = await getTodaySalatChecklist();
  const next = { ...current, [key]: !current[key] };
  await AsyncStorage.setItem(todayKey(), JSON.stringify(next));
  return next;
}
