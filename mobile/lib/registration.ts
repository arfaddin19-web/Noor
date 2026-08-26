import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";
import { normalizePhone } from "./phoneAuth";

const STORAGE_KEY = "noor.registration";

export type Gender = "male" | "female";

export interface Registration {
  id: string;
  full_name: string;
  phone: string;
  city: string | null;
  gender: Gender | null;
}

export async function getLocalRegistration(): Promise<Registration | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Registration;
  } catch {
    return null;
  }
}

async function saveLocalRegistration(reg: Registration): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reg));
}

export async function clearLocalRegistration(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export type RegisterResult =
  | { ok: true; registration: Registration; recovered: boolean }
  | { ok: false; error: string };

/** Registers a new phone number, or — if that number is already registered
 *  (e.g. the app was reinstalled and lost its local record) — recovers the
 *  existing record instead of failing. No password involved either way. */
export async function registerUser(input: {
  fullName: string;
  phone: string;
  city: string;
  gender: Gender;
}): Promise<RegisterResult> {
  const phone = normalizePhone(input.phone);

  const { data, error } = await supabase
    .from("registrations")
    .insert({
      full_name: input.fullName.trim(),
      phone,
      city: input.city.trim() || null,
      gender: input.gender,
    })
    .select("id, full_name, phone, city, gender")
    .single();

  if (!error && data) {
    const registration = data as Registration;
    await saveLocalRegistration(registration);
    return { ok: true, registration, recovered: false };
  }

  // Postgres unique_violation — this phone is already registered. Recover
  // the existing record rather than treating it as a hard failure.
  if (error?.code === "23505") {
    const { data: existing, error: lookupError } = await supabase.rpc(
      "find_registration_by_phone",
      { p_phone: phone }
    );
    const row = Array.isArray(existing) ? existing[0] : existing;
    if (!lookupError && row) {
      const registration = row as Registration;
      await saveLocalRegistration(registration);
      return { ok: true, registration, recovered: true };
    }
    return { ok: false, error: "That phone number is already registered." };
  }

  return { ok: false, error: "Couldn't register — check your connection and try again." };
}
