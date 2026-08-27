import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenBackground from "../components/ScreenBackground";
import { useRegistration } from "../lib/useRegistration";
import { isPremium } from "../lib/premium";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

interface Feature {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

// What Premium is planned to include — none of these exist in the app yet.
// Listed honestly as "coming" rather than pretending they're built.
const FEATURES: Feature[] = [
  {
    icon: "play-circle-outline",
    title: "Qur'an audio recitation",
    description: "Listen to a reciter while you follow along, with auto-scroll.",
  },
  {
    icon: "musical-notes-outline",
    title: "More Adhan sounds",
    description: "Choose from multiple reciters for your prayer notifications.",
  },
  {
    icon: "sparkles-outline",
    title: "More, over time",
    description: "New premium features will be added here as they're built.",
  },
];

export default function PremiumScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { registration } = useRegistration();
  const premium = isPremium(registration);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.hero}>
          <View style={styles.starWrap}>
            <Ionicons name="star" size={28} color={theme.colors.gold} />
          </View>
          <Text style={styles.heroTitle}>Noor Premium</Text>
          <Text style={styles.heroSubtitle}>
            {premium
              ? "You have Noor Premium — jazakAllah khair for supporting Noor."
              : "A few extra features for those who'd like to support Noor and unlock more."}
          </Text>
        </View>

        {FEATURES.map((f) => (
          <View key={f.title} style={[styles.card, theme.cardShadow]}>
            <View style={styles.cardIconWrap}>
              <Ionicons name={f.icon} size={20} color={theme.colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{f.title}</Text>
              <Text style={styles.cardDescription}>{f.description}</Text>
            </View>
          </View>
        ))}

        {!premium && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.button} disabled>
              <Text style={styles.buttonText}>Not available yet</Text>
            </TouchableOpacity>
            <Text style={styles.footerNote}>
              Noor Premium isn't purchasable yet — it'll open up once Noor is available on the
              App Store and Google Play. For now, everything in the app is free.
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    page: { padding: theme.spacing.md, paddingBottom: 40 },
    hero: { alignItems: "center", paddingVertical: 20, gap: 6 },
    starWrap: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.cardBg,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6,
    },
    heroTitle: { fontSize: 22, fontWeight: "800", color: theme.colors.textPrimary },
    heroSubtitle: {
      fontSize: 13,
      color: theme.colors.textMuted,
      textAlign: "center",
      paddingHorizontal: 20,
      lineHeight: 19,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    cardIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.pageBg,
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitle: { fontSize: 14, fontWeight: "700", color: theme.colors.textPrimary },
    cardDescription: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2, lineHeight: 17 },
    footer: { marginTop: 16, alignItems: "center", gap: 10 },
    button: {
      backgroundColor: theme.colors.border,
      borderRadius: theme.radius.pill,
      paddingHorizontal: 28,
      paddingVertical: 13,
    },
    buttonText: { color: theme.colors.textMuted, fontWeight: "700", fontSize: 14 },
    footerNote: {
      fontSize: 11,
      color: theme.colors.textMuted,
      textAlign: "center",
      paddingHorizontal: 30,
      lineHeight: 16,
    },
  });
}
