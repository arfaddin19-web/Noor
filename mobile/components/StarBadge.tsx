import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

/** An 8-point star badge (two overlapping squares, one rotated 45°) with a number
 *  inside — no image/SVG needed, matches the reference design's surah number badges. */
export default function StarBadge({ number, size = 34 }: { number: number; size?: number }) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const squareSize = size * 0.72;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View
        style={[
          styles.square,
          { width: squareSize, height: squareSize, borderRadius: squareSize * 0.22 },
        ]}
      />
      <View
        style={[
          styles.square,
          {
            width: squareSize,
            height: squareSize,
            borderRadius: squareSize * 0.22,
            transform: [{ rotate: "45deg" }],
          },
        ]}
      />
      <Text style={[styles.number, { fontSize: size * 0.34 }]}>{number}</Text>
    </View>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    square: {
      position: "absolute",
      backgroundColor: theme.colors.pageBg,
      borderWidth: 1.5,
      borderColor: theme.colors.accent,
    },
    number: { color: theme.colors.accent, fontWeight: "800" },
  });
}
