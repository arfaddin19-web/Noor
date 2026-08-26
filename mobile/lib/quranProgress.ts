import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_READ_KEY = "noor.quran.lastRead";
const ACTIVITY_KEY_PREFIX = "noor.quran.activity."; // + date

export interface LastRead {
  type: "surah" | "juz" | "page";
  number: number;
  label: string; // e.g. "Al-Ma'idah", "Juz 5", "Page 12"
  at: string; // ISO date
}

export async function saveLastRead(entry: Omit<LastRead, "at">): Promise<void> {
  const value: LastRead = { ...entry, at: new Date().toISOString() };
  await AsyncStorage.setItem(LAST_READ_KEY, JSON.stringify(value));
  await recordQuranActivityToday();
}

export async function getLastRead(): Promise<LastRead | null> {
  const raw = await AsyncStorage.getItem(LAST_READ_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LastRead;
  } catch {
    return null;
  }
}

function todayKey(): string {
  return ACTIVITY_KEY_PREFIX + new Date().toISOString().slice(0, 10);
}

/** Counts distinct reading sessions opened today — a simple, honest proxy for
 *  "Qur'an activity today" shown on Home (not a fabricated completion %). */
async function recordQuranActivityToday(): Promise<void> {
  const key = todayKey();
  const current = parseInt((await AsyncStorage.getItem(key)) ?? "0", 10);
  await AsyncStorage.setItem(key, String(current + 1));
}

export async function getQuranActivityToday(): Promise<number> {
  const raw = await AsyncStorage.getItem(todayKey());
  return raw ? parseInt(raw, 10) : 0;
}
