import React, { useMemo } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenBackground from "../components/ScreenBackground";
import { useNotificationSettings, useAdhanSoundSetting } from "../lib/notifications";
import { useThemeMode } from "../lib/ThemeContext";
import type { Theme } from "../theme";

function Row({
  icon,
  label,
  subtitle,
  theme,
  right,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  theme: Theme;
  right: React.ReactNode;
}) {
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.row}>
      <View style={styles.rowIconWrap}>
        <Ionicons name={icon} size={20} color={theme.colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      {right}
    </View>
  );
}

export default function SettingsScreen() {
  const { theme, mode, setMode } = useThemeMode();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const notifs = useNotificationSettings();
  const adhanSound = useAdhanSoundSetting();

  return (
    <ScreenBackground>
    <ScrollView style={styles.page} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.sectionTitle}>Prayer notifications</Text>
      <View style={[styles.card, theme.cardShadow]}>
        <Row
          icon="notifications-outline"
          label="Prayer time reminders"
          subtitle="Get a notification at each Adhan time today."
          theme={theme}
          right={
            notifs.loading ? (
              <ActivityIndicator />
            ) : (
              <Switch value={notifs.enabled} onValueChange={notifs.toggle} />
            )
          }
        />
        <View style={styles.divider} />
        <Row
          icon="volume-high-outline"
          label="Adhan sound"
          subtitle="Play a sound with the prayer notification, not just a silent banner."
          theme={theme}
          right={
            adhanSound.loading ? (
              <ActivityIndicator />
            ) : (
              <Switch
                value={adhanSound.enabled}
                onValueChange={adhanSound.toggle}
                disabled={!notifs.enabled}
              />
            )
          }
        />
      </View>

      <Text style={styles.sectionTitle}>Appearance</Text>
      <View style={[styles.card, theme.cardShadow]}>
        <Row
          icon="moon-outline"
          label="Dark theme"
          subtitle="Switch between the deep-green dark theme and a light theme."
          theme={theme}
          right={
            <Switch
              value={mode === "dark"}
              onValueChange={(v) => setMode(v ? "dark" : "light")}
            />
          }
        />
      </View>

      <Text style={styles.sectionTitle}>About</Text>
      <View style={[styles.card, theme.cardShadow]}>
        <Row
          icon="information-circle-outline"
          label="Noor"
          subtitle="Crafted with care for the Ummah — AR Technohub"
          theme={theme}
          right={null}
        />
      </View>
    </ScrollView>
    </ScreenBackground>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: "transparent" },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 8,
      marginTop: 16,
    },
    card: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.md,
    },
    row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 12 },
    rowIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.pageBg,
      alignItems: "center",
      justifyContent: "center",
    },
    rowLabel: { fontSize: 14, fontWeight: "700", color: theme.colors.textPrimary },
    rowSubtitle: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2, lineHeight: 15 },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border },
  });
}
