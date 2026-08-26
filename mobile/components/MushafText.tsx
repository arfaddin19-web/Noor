import React, { useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import { toArabicIndicDigits } from "../lib/arabicNumerals";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

export interface MushafAyah {
  number: number; // ayah number within its surah
  text: string;
}

/** Renders a block of ayahs as continuous, right-to-left flowing Mushaf-style
 *  text — one wrapped paragraph, not a list of separate boxed cards — with a
 *  small inline marker after each ayah (in Arabic-Indic numerals), the way a
 *  printed Qur'an reads. */
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
          <Text style={styles.ayahText}>{ayah.text}</Text>
          <Text style={[styles.marker, { fontSize: fontSize * 0.42 }]}>
            {" "}
            ‏﴿{toArabicIndicDigits(ayah.number)}﴾{" "}
          </Text>
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
    },
    ayahText: { color: theme.colors.textPrimary },
    marker: {
      color: theme.colors.accent,
      fontWeight: "700",
    },
  });
}
