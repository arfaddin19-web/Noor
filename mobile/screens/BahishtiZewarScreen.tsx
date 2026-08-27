import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../App";
import ScreenBackground from "../components/ScreenBackground";
import { BZ_CHAPTERS } from "../lib/bahishtiZewar";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

type Nav = NativeStackNavigationProp<HomeStackParamList, "BahishtiZewar">;

export default function BahishtiZewarScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState("");

  const chapters = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BZ_CHAPTERS;
    return BZ_CHAPTERS.filter((c) => c.title.toLowerCase().includes(q));
  }, [query]);

  return (
    <ScreenBackground>
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={theme.colors.textMuted} />
        <TextInput
          placeholder="Search chapters…"
          placeholderTextColor={theme.colors.textMuted}
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>
      <FlatList
        style={styles.page}
        contentContainerStyle={styles.listContent}
        data={chapters}
        keyExtractor={(c) => String(c.id)}
        ListHeaderComponent={
          <Text style={styles.intro}>
            Heavenly Ornaments (Bahishti Zewar) — Maulana Ashraf Ali Thanwi's classic fiqh
            manual, English translation, {BZ_CHAPTERS.length} chapters. Digitized from a
            scanned copy — see the note on the first chapter for details.
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, theme.cardShadow]}
            onPress={() => navigation.navigate("BahishtiZewarChapter", { id: item.id })}
          >
            <Text style={styles.rowIndex}>{item.id + 1}</Text>
            <Text style={styles.rowLabel}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.muted}>No chapters match "{query}".</Text>}
      />
    </ScreenBackground>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: "transparent" },
    listContent: { padding: theme.spacing.md },
    intro: {
      fontSize: 12,
      color: theme.colors.textMuted,
      lineHeight: 18,
      marginBottom: theme.spacing.md,
      paddingHorizontal: 4,
    },
    searchWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.radius.pill,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchInput: { flex: 1, fontSize: 14, color: theme.colors.textPrimary, padding: 0 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 13,
      marginBottom: theme.spacing.sm,
    },
    rowIndex: { fontSize: 12, fontWeight: "700", color: theme.colors.accent, width: 22 },
    rowLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: theme.colors.textPrimary },
    muted: { color: theme.colors.textMuted, textAlign: "center", marginTop: 24 },
  });
}
