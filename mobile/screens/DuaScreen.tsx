import React, { useMemo, useState } from "react";
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DUA_CATEGORIES, DuaEntry } from "../lib/duaData";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

function DuaCard({ item, theme }: { item: DuaEntry; theme: Theme }) {
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={[styles.card, theme.cardShadow]}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.arabic}>{item.arabic}</Text>
      <Text style={styles.transliteration}>{item.transliteration}</Text>
      <Text style={styles.translation}>{item.translation}</Text>
      {item.reference && <Text style={styles.reference}>{item.reference}</Text>}
    </View>
  );
}

export default function DuaScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const sections = DUA_CATEGORIES.map((c) => ({
    key: c.key,
    title: c.title,
    data: collapsed[c.key] ? [] : c.items,
  }));

  function toggle(key: string) {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <SectionList
      style={styles.page}
      contentContainerStyle={styles.listContent}
      sections={sections}
      keyExtractor={(item) => item.title}
      renderItem={({ item }) => <DuaCard item={item} theme={theme} />}
      renderSectionHeader={({ section }) => (
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggle(section.key)}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Ionicons
            name={collapsed[section.key] ? "chevron-down" : "chevron-up"}
            size={18}
            color={theme.colors.accent}
          />
        </TouchableOpacity>
      )}
      stickySectionHeadersEnabled={false}
    />
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.colors.pageBg },
    listContent: { padding: theme.spacing.md, paddingBottom: 40 },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.accent,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 12,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    sectionTitle: { color: "white", fontWeight: "700", fontSize: 15 },
    card: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    title: { fontSize: 13, fontWeight: "700", color: theme.colors.accent, marginBottom: 10 },
    arabic: {
      fontSize: 21,
      textAlign: "right",
      lineHeight: 36,
      color: theme.colors.textPrimary,
      marginBottom: 10,
    },
    transliteration: {
      fontSize: 13,
      fontStyle: "italic",
      color: theme.colors.textMuted,
      lineHeight: 19,
      marginBottom: 6,
    },
    translation: { fontSize: 13, color: theme.colors.textPrimary, lineHeight: 20 },
    reference: { fontSize: 11, color: theme.colors.textMuted, marginTop: 8, fontWeight: "600" },
  });
}
