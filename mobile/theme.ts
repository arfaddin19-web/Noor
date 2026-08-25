/** Noor design tokens — used by the "hero" screens (Onboarding, Home, Masjid Detail)
 *  that adopt the dark skyline / frosted-glass look from the reference designs. */

export const theme = {
  colors: {
    // Night-sky gradient, dusk blue-grey fading to a deep teal-black horizon.
    skyTop: "#4a6a78",
    skyMid: "#2c4650",
    skyBottom: "#0f2226",

    skyline: "#16282b", // mosque silhouette
    skylineDark: "#0c1719",

    moon: "#f4ecd8",

    // Frosted glass cards over the skyline
    glass: "rgba(255,255,255,0.14)",
    glassBorder: "rgba(255,255,255,0.22)",
    glassStrong: "rgba(255,255,255,0.22)",

    textOnDark: "#fbf7ee",
    textOnDarkMuted: "rgba(251,247,238,0.7)",

    gold: "#e3b872",
    accent: "#0e8a72", // brand green, used for CTAs/active states everywhere
    accentDark: "#095a4a",

    // Icon grid tile colors (soft, varied — like the reference's colorful icon set)
    tile1: "#f4a97a", // Qibla
    tile2: "#7ec9b7", // Qur'an
    tile3: "#f2c265", // Hadith
    tile4: "#8fb7e8", // Nearby
    tile5: "#e39ab0", // Ask
    tile6: "#a690e0", // Account

    cardBg: "#ffffff",
    pageBg: "#f7faf9",
    textPrimary: "#111827",
    textMuted: "#6b7280",
    border: "#e5e7eb",
  },
  radius: {
    md: 14,
    lg: 20,
    xl: 28,
    pill: 999,
  },
};

export type Theme = typeof theme;
