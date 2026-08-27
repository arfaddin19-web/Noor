import AsyncStorage from "@react-native-async-storage/async-storage";

/** Generic "remember the last page read" helper, keyed by book slug — so it
 *  works for any scanned book, not just one hardcoded title. */

function keyFor(slug: string): string {
  return `noor.scannedBook.${slug}.lastPage`;
}

export async function getLastScannedBookPage(slug: string): Promise<number> {
  const raw = await AsyncStorage.getItem(keyFor(slug));
  const n = raw ? parseInt(raw, 10) : 1;
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export async function saveLastScannedBookPage(slug: string, page: number): Promise<void> {
  await AsyncStorage.setItem(keyFor(slug), String(page));
}
