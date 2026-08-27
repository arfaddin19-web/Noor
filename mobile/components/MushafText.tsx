import React, { useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import { useTheme } from "../lib/ThemeContext";
import { ARABIC_FONT_REGULAR } from "../theme";
import type { Theme } from "../theme";

export interface MushafAyah {
  number: number; // ayah number within its surah — unused for rendering (see below), kept for callers/keys
  text: string;
}

/** Renders a block of ayahs as continuous, right-to-left flowing Mushaf-style
 *  text — one wrapped paragraph, not a list of separate boxed cards — the way
 *  a printed Qur'an reads. `ayah.text` (from lib/quranText.ts's bundled QPC
 *  data) already ends with its own Arabic-Indic ayah-number digit — that's
 *  the actual source text, not something added here — and UthmanicHafs has a
 *  built-in ligature that automatically draws the traditional ornamental
 *  circle around it. This used to *also* append `ayah.number` as a second
 *  marker on top of that embedded one, which doubled every ayah number on
 *  screen; fixed by just rendering the text as-is. */
export default function MushafText({
  ayahs,
  fontSize,
  lineHeight,
}: {
  ayahs: MushafAyah[];
  fontSize: number;
  lineHeight: number;
}) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Text style={[styles.block, { fontSize, lineHeight }]}>
      {ayahs.map((ayah, i) => (
        <Text key={i}>{ayah.text} </Text>
      ))}
    </Text>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    block: {
      textAlign: "right",
      writingDirection: "rtl",
      color: theme.colors.textPrimary,
      fontFamily: ARABIC_FONT_REGULAR,
    },
  });
}
