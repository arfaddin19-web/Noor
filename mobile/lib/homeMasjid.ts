import AsyncStorage from "@react-native-async-storage/async-storage";

const SETUP_DONE_KEY = "noor.masjidSetupDone";
const MASJID_ID_KEY = "noor.homeMasjidId";
const CITY_KEY = "noor.homeCity";

export async function isMasjidSetupDone(): Promise<boolean> {
  return (await AsyncStorage.getItem(SETUP_DONE_KEY)) === "true";
}

export async function getHomeMasjidId(): Promise<string | null> {
  return AsyncStorage.getItem(MASJID_ID_KEY);
}

export async function getHomeCity(): Promise<string | null> {
  return AsyncStorage.getItem(CITY_KEY);
}

/** Save the chosen masjid (or clear it, if the user picks "no specific masjid")
 *  and mark first-time setup as done either way, including on Skip. */
export async function saveHomeMasjid(city: string | null, masjidId: string | null): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(SETUP_DONE_KEY, "true"),
    city ? AsyncStorage.setItem(CITY_KEY, city) : AsyncStorage.removeItem(CITY_KEY),
    masjidId
      ? AsyncStorage.setItem(MASJID_ID_KEY, masjidId)
      : AsyncStorage.removeItem(MASJID_ID_KEY),
  ]);
}
