import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../lib/ThemeContext";

/** A soft two-stop wash used behind content screens instead of a flat page
 *  color, so nothing reads as an empty plain background. Subtle by design —
 *  cards still sit on solid `cardBg` for readability. */
export default function ScreenBackground({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  return (
    <LinearGradient
      colors={[theme.colors.pageGradientTop, theme.colors.pageGradientBottom]}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </LinearGradient>
  );
}
