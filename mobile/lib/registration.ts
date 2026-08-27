import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

const STORAGE_KEY = "noor.registration";

export type Gender = "male" | "female";

export interface Registration {
  id: string;
  full_name: string;
  city: string | null;
  gender: Gender | null;
  occupation: string | null;
  is_premium: boolean;
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
  | { ok: true; registration: Registration }
  | { ok: false; error: string };

/** One-time, no-password registration: Name, City, Gender, Occupation. No
 *  phone number (dropped — it was never verified, so anyone could type
 *  anyone else's) and no recovery-by-identifier: a reinstalled app just
 *  registers fresh, same as any other on-device-only preference. */
export async function registerUser(input: {
  fullName: string;
  city: string;
  gender: Gender;
  occupation: string;
}): Promise<RegisterResult> {
  const { data, error } = await supabase
    .from("registrations")
    .insert({
      full_name: input.fullName.trim(),
      city: input.city.trim() || null,
      gender: input.gender,
      occupation: input.occupation.trim() || null,
    })
    .select("id, full_name, city, gender, occupation, is_premium")
    .single();

  if (!error && data) {
    const registration = data as Registration;
    await saveLocalRegistration(registration);
    return { ok: true, registration };
  }

  return { ok: false, error: "Couldn't register — check your connection and try again." };
}

/** Re-fetches this device's registration row from the server (e.g. to pick
 *  up an is_premium flag an admin just granted) and updates the local copy.
 *  No-op if this device was never registered. */
export async function refreshRegistration(): Promise<Registration | null> {
  const local = await getLocalRegistration();
  if (!local) return null;
  // registrations has no general SELECT policy (only admins can browse it) —
  // this narrow RPC returns only the one row whose exact id is already
  // known locally. See 0017_registration_no_phone.sql.
  const { data } = await supabase.rpc("get_registration", { p_id: local.id });
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return local;
  const registration = row as Registration;
  await saveLocalRegistration(registration);
  return registration;
}
