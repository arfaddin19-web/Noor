import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenBackground from "../components/ScreenBackground";
import { getDonationInfo, DonationInfo } from "../lib/donation";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

const ROWS: { key: keyof DonationInfo; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "bank_name", label: "Bank", icon: "business-outline" },
  { key: "account_name", label: "Account name", icon: "person-outline" },
  { key: "account_number", label: "Account number", icon: "card-outline" },
  { key: "esewa_id", label: "eSewa ID", icon: "phone-portrait-outline" },
  { key: "khalti_id", label: "Khalti ID", icon: "phone-portrait-outline" },
];

export default function DonateScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [info, setInfo] = useState<DonationInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDonationInfo()
      .then(setInfo)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.accent} />
      </View>
    );
  }

  const hasAnyDetail = info && ROWS.some((r) => info[r.key]);

  return (
    <ScreenBackground>
    <ScrollView style={styles.page} contentContainerStyle={{ padding: 16 }}>
      <View style={[styles.heroCard, theme.cardShadow]}>
        <Ionicons name="heart" size={32} color={theme.colors.gold} />
        <Text style={styles.heroTitle}>Support Noor</Text>
        <Text style={styles.heroBody}>
          {info?.message ||
            "Your support helps keep prayer times, masjid listings, and the Qur'an accessible to everyone, free of charge."}
        </Text>
      </View>

      {hasAnyDetail ? (
        <View style={[styles.card, theme.cardShadow]}>
          {ROWS.filter((r) => info && info[r.key]).map((r, i, arr) => (
            <View key={r.key}>
              <View style={styles.row}>
                <Ionicons name={r.icon} size={18} color={theme.colors.accent} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.rowLabel}>{r.label}</Text>
                  <Text style={styles.rowValue} selectable>
                    {info![r.key]}
                  </Text>
                </View>
              </View>
              {i < arr.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
          <Text style={styles.hint}>Tap and hold a value to copy it.</Text>
        </View>
      ) : (
        <View style={[styles.card, theme.cardShadow]}>
          <Text style={styles.muted}>
            Donation details haven't been added yet. Please check back soon.
          </Text>
        </View>
      )}
    </ScrollView>
    </ScreenBackground>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: "transparent" },
    center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "transparent" },
    heroCard: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    heroTitle: { fontSize: 18, fontWeight: "800", color: theme.colors.textPrimary, marginTop: 10 },
    heroBody: {
      fontSize: 13,
      color: theme.colors.textMuted,
      textAlign: "center",
      marginTop: 8,
      lineHeight: 19,
    },
    card: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 6,
    },
    row: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
    rowLabel: { fontSize: 11, color: theme.colors.textMuted, fontWeight: "600" },
    rowValue: { fontSize: 15, color: theme.colors.textPrimary, fontWeight: "700", marginTop: 2 },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border },
    hint: { fontSize: 11, color: theme.colors.textMuted, textAlign: "center", paddingVertical: 12 },
    muted: { color: theme.colors.textMuted, textAlign: "center", paddingVertical: 20 },
  });
}
