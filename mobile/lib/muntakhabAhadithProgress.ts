import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_PAGE_KEY = "noor.muntakhabAhadith.lastPage";

export async function getLastMuntakhabPage(): Promise<number> {
  const raw = await AsyncStorage.getItem(LAST_PAGE_KEY);
  const n = raw ? parseInt(raw, 10) : 1;
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export async function saveLastMuntakhabPage(page: number): Promise<void> {
  await AsyncStorage.setItem(LAST_PAGE_KEY, String(page));
}
