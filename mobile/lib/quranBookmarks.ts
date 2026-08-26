import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "noor.quran.bookmarks";

export interface Bookmark {
  type: "surah" | "juz" | "page";
  number: number;
  label: string;
  at: string; // ISO date
}

function idOf(type: Bookmark["type"], number: number): string {
  return `${type}-${number}`;
}

export async function getBookmarks(): Promise<Bookmark[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw) as Bookmark[];
    return list.sort((a, b) => (a.at < b.at ? 1 : -1));
  } catch {
    return [];
  }
}

export async function isBookmarked(type: Bookmark["type"], number: number): Promise<boolean> {
  const list = await getBookmarks();
  return list.some((b) => idOf(b.type, b.number) === idOf(type, number));
}

/** Adds the bookmark if it isn't already saved, or removes it if it is. Returns
 *  the resulting bookmarked state (true = now saved). */
export async function toggleBookmark(entry: Omit<Bookmark, "at">): Promise<boolean> {
  const list = await getBookmarks();
  const id = idOf(entry.type, entry.number);
  const exists = list.some((b) => idOf(b.type, b.number) === id);
  const next = exists
    ? list.filter((b) => idOf(b.type, b.number) !== id)
    : [...list, { ...entry, at: new Date().toISOString() }];
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return !exists;
}

export async function removeBookmark(type: Bookmark["type"], number: number): Promise<void> {
  const list = await getBookmarks();
  const next = list.filter((b) => idOf(b.type, b.number) !== idOf(type, number));
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}
