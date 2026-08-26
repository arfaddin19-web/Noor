/** Noor design tokens — used by the "hero" screens (Onboarding, Home, Masjid Detail,
 *  Qibla) that adopt the deep-emerald / frosted-glass look from the reference designs. */

export const theme = {
  colors: {
    // Deep emerald-green gradient, matching the reference mockups' mosque-illustration hero.
    skyTop: "#1e5c47",
    skyMid: "#134536",
    skyBottom: "#0a2620",

    skyline: "#0f3a2d", // mosque silhouette
    skylineDark: "#082019",

    moon: "#f4ecd8",

    // Frosted glass cards over the hero
    glass: "rgba(255,255,255,0.14)",
    glassBorder: "rgba(255,255,255,0.22)",
    glassStrong: "rgba(255,255,255,0.22)",

    textOnDark: "#fbf7ee",
    textOnDarkMuted: "rgba(251,247,238,0.7)",

    gold: "#e0b877",
    accent: "#0e8a72", // brand green, used for CTAs/active states everywhere
    accentDark: "#095a4a",

    // Icon grid tile colors (soft, varied — like the reference's colorful icon set)
    tile1: "#f4a97a", // Qibla
    tile2: "#7ec9b7", // Qur'an
    tile3: "#f2c265", // Hadith
    tile4: "#8fb7e8", // Nearby
    tile5: "#e39ab0", // Ask
    tile6: "#a690e0", // Account
    tile7: "#8fd6c4", // Tasbih

    cardBg: "#ffffff",
    pageBg: "#eef7f2", // light mint, matching the reference's content-screen background
    textPrimary: "#0f2b22",
    textMuted: "#5b7a6f",
    border: "#dcece5",
  },
  radius: {
    md: 14,
    lg: 20,
    xl: 28,
    pill: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20,
    xl: 28,
  },
  // A single soft-elevation style used on every card/button across the app, so
  // nothing reads as a flat, unstyled block. Spread this into a style array.
  cardShadow: {
    shadowColor: "#0a2620",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
};

export type Theme = typeof theme;
