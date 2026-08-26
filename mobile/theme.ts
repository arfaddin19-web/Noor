/** Noor design tokens. Two palettes — "dark" (deep emerald, the app's default look)
 *  and "light" — sharing the same shape, so every screen can call `useTheme()` and
 *  restyle instantly when the user flips the Dark theme setting. */

export interface ThemeColors {
  // Hero gradient (Home/Onboarding/Masjid Setup) + mosque skyline
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  skyline: string;
  skylineDark: string;
  moon: string;

  // Frosted glass cards over the hero
  glass: string;
  glassBorder: string;
  glassStrong: string;

  textOnDark: string;
  textOnDarkMuted: string;

  gold: string;
  accent: string;
  accentDark: string;
  danger: string;

  // Icon grid tile colors (soft, varied)
  tile1: string;
  tile2: string;
  tile3: string;
  tile4: string;
  tile5: string;
  tile6: string;
  tile7: string;
  tile8: string;

  cardBg: string;
  pageBg: string;
  // A subtle two-stop wash used behind content screens instead of a flat
  // pageBg, so nothing reads as an empty plain background.
  pageGradientTop: string;
  pageGradientBottom: string;
  textPrimary: string;
  textMuted: string;
  border: string;
}

export interface Theme {
  mode: "light" | "dark";
  colors: ThemeColors;
  radius: { md: number; lg: number; xl: number; pill: number };
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number };
  cardShadow: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

const radius = { md: 14, lg: 20, xl: 28, pill: 999 };
const spacing = { xs: 4, sm: 8, md: 16, lg: 20, xl: 28 };

// Colors shared by both palettes — the emerald hero, gold accents, and the
// icon-grid tile colors stay the same whether the rest of the app is light or dark.
const shared = {
  skyTop: "#1e5c47",
  skyMid: "#134536",
  skyBottom: "#0a2620",
  skyline: "#0f3a2d",
  skylineDark: "#082019",
  moon: "#f4ecd8",

  glass: "rgba(255,255,255,0.14)",
  glassBorder: "rgba(255,255,255,0.22)",
  glassStrong: "rgba(255,255,255,0.22)",

  textOnDark: "#fbf7ee",
  textOnDarkMuted: "rgba(251,247,238,0.7)",

  gold: "#e0b877",
  accent: "#12a186",
  accentDark: "#095a4a",
  danger: "#e5626a",

  tile1: "#f4a97a", // Qibla
  tile2: "#7ec9b7", // Qur'an
  tile3: "#f2c265", // Hadith
  tile4: "#8fb7e8", // Halal Food
  tile5: "#e39ab0", // Ask
  tile6: "#a690e0", // Account
  tile7: "#8fd6c4", // Tasbih
  tile8: "#f0a5a5", // Donate / Masjids / Dua / Settings (reused across the wider grid)
};

const darkColors: ThemeColors = {
  ...shared,
  cardBg: "#123d30",
  pageBg: "#081c17",
  pageGradientTop: "#123626",
  pageGradientBottom: "#081c17",
  textPrimary: "#f4efe3",
  textMuted: "rgba(244,239,227,0.64)",
  border: "rgba(255,255,255,0.10)",
};

const lightColors: ThemeColors = {
  ...shared,
  cardBg: "#ffffff",
  pageBg: "#eef7f2",
  pageGradientTop: "#e6f5ed",
  pageGradientBottom: "#f6fbf9",
  textPrimary: "#0f2b22",
  textMuted: "#5b7a6f",
  border: "#dcece5",
};

const darkShadow = {
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.4,
  shadowRadius: 12,
  elevation: 4,
};

const lightShadow = {
  shadowColor: "#0a2620",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 2,
};

// Amiri Quran — the heavier, purpose-built cut of the Amiri family for
// continuous Mushaf-style Quranic text (closer to the dense, bold look of a
// printed Mushaf than the general-purpose Amiri Regular). The exact font in
// the user's reference photo is the King Fahd Complex "Uthmanic Hafs"
// typeface, which is non-commercial-only licensed and can't legally be
// bundled in this app without buying a license — Amiri Quran is the closest
// OFL-licensed (free, commercial-use-allowed) match. Loaded via expo-font in
// App.tsx (assets/fonts/AmiriQuran-Regular.ttf + Amiri-Bold.ttf). Used for
// every block of Arabic in the app (Qur'an reader, Dua/Kalima text, Ayah of
// the Day). Amiri Quran has no bold cut, so ayah-marker numerals still use
// regular Amiri Bold.
export const ARABIC_FONT_REGULAR = "AmiriQuran-Regular";
export const ARABIC_FONT_BOLD = "Amiri-Bold";

export function getTheme(mode: "light" | "dark"): Theme {
  return {
    mode,
    colors: mode === "dark" ? darkColors : lightColors,
    radius,
    spacing,
    cardShadow: mode === "dark" ? darkShadow : lightShadow,
  };
}
