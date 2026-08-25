import React from "react";
import { View, StyleSheet } from "react-native";

/** A simple, dependency-free mosque skyline silhouette built from plain Views
 *  (domes + minarets), used as the backdrop on Onboarding/Home. No image assets
 *  or SVG library needed — everything here is basic shapes and borders. */

function Dome({ size, color }: { size: number; color: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <View style={[styles.finialStem, { height: size * 0.18, backgroundColor: color }]} />
      <View
        style={{
          width: size,
          height: size / 2,
          borderTopLeftRadius: size / 2,
          borderTopRightRadius: size / 2,
          backgroundColor: color,
        }}
      />
      <View style={{ width: size * 0.62, height: size * 0.55, backgroundColor: color }} />
    </View>
  );
}

function Minaret({ height, color }: { height: number; color: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 5,
          borderRightWidth: 5,
          borderBottomWidth: 9,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: color,
        }}
      />
      <View style={{ width: 7, height, backgroundColor: color }} />
    </View>
  );
}

export default function MosqueSkyline({
  color = "#16282b",
  style,
}: {
  color?: string;
  style?: object;
}) {
  return (
    <View style={[styles.row, style]} pointerEvents="none">
      <Minaret height={70} color={color} />
      <Dome size={44} color={color} />
      <Minaret height={100} color={color} />
      <Dome size={78} color={color} />
      <Minaret height={110} color={color} />
      <Dome size={46} color={color} />
      <Minaret height={72} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: "100%",
  },
  finialStem: { width: 3 },
});
