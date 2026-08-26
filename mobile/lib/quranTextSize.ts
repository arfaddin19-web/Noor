import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "noor.quran.textSize";

export type TextSize = "small" | "medium" | "large";

const ORDER: TextSize[] = ["small", "medium", "large"];

const ARABIC_FONT_SIZE: Record<TextSize, number> = { small: 21, medium: 26, large: 32 };
const ARABIC_LINE_HEIGHT: Record<TextSize, number> = { small: 40, medium: 48, large: 58 };

export function arabicFontSizeFor(size: TextSize): number {
  return ARABIC_FONT_SIZE[size];
}

export function arabicLineHeightFor(size: TextSize): number {
  return ARABIC_LINE_HEIGHT[size];
}

export function nextTextSize(size: TextSize): TextSize {
  return ORDER[(ORDER.indexOf(size) + 1) % ORDER.length];
}

export async function getTextSize(): Promise<TextSize> {
  const v = await AsyncStorage.getItem(KEY);
  return v === "small" || v === "medium" || v === "large" ? v : "medium";
}

export async function setTextSize(size: TextSize): Promise<void> {
  await AsyncStorage.setItem(KEY, size);
}
