import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

export default function AyahCard({
  number,
  arabicText,
  translationText,
  showTranslation,
}: {
  number: number;
  arabicText: string;
  translationText?: string;
  showTranslation: boolean;
}) {
  return (
    <View style={[styles.card, theme.cardShadow]}>
      <View style={styles.numberBadge}>
        <Text style={styles.numberText}>{number}</Text>
      </View>
      <Text style={styles.arabicText}>{arabicText}</Text>
      {showTranslation && translationText && (
        <Text style={styles.translationText}>{translationText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  numberBadge: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.pageBg,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 10,
  },
  numberText: { fontSize: 11, color: theme.colors.accent, fontWeight: "700" },
  arabicText: {
    fontSize: 23,
    textAlign: "right",
    lineHeight: 40,
    color: theme.colors.textPrimary,
    marginBottom: 10,
  },
  translationText: { fontSize: 14, color: theme.colors.textMuted, lineHeight: 21 },
});
