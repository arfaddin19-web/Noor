import React, { useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import { toArabicIndicDigits } from "../lib/arabicNumerals";
import { useTheme } from "../lib/ThemeContext";
import { ARABIC_FONT_REGULAR } from "../theme";
import type { Theme } from "../theme";

export interface MushafAyah {
  number: number; // ayah number within its surah
  text: string;
}

/** Renders a block of ayahs as continuous, right-to-left flowing Mushaf-style
 *  text — one wrapped paragraph, not a list of separate boxed cards — with a
 *  small inline marker after each ayah (in Arabic-Indic numerals), the way a
 *  printed Qur'an reads. The marker is just the bare digits in the same font
 *  as the body text — UthmanicHafs has a built-in ligature that automatically
 *  draws the traditional ornamental circle around Arabic-Indic digits (single
 *  or multi-digit alike), so no manual bracket characters or separate marker
 *  font are needed; using a different font here is what broke that ligature
 *  before. */
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
        <Text key={i}>
          {ayah.text} {toArabicIndicDigits(ayah.number)}{" "}
        </Text>
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
