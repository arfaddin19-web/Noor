import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, SectionList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import type { HomeStackParamList } from "../App";
import ScreenBackground from "../components/ScreenBackground";
import { HADITH_BOOKS } from "../lib/hadithBooks";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

// Free, no-key hadith API: https://github.com/fawazahmed0/hadith-api
// One request returns the entire collection — thousands of hadith for
// Bukhari/Muslim, so this can take a moment to load on first open.
const BASE = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";

interface RawHadith {
  hadithnumber: number;
  text: string;
  reference?: { book?: number; hadith?: number };
}

type Lang = "en" | "ur";
type Route = RouteProp<HomeStackParamList, "HadithBook">;

export default function HadithBookScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { params } = useRoute<Route>();
  const book = HADITH_BOOKS.find((b) => b.key === params.key);
  const [lang, setLang] = useState<Lang>("en");
  const [hadiths, setHadiths] = useState<RawHadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!book) return;
    const slug = lang === "en" ? book.editionEn : book.editionUr;
    if (!slug) return;
    setLoading(true);
    setError(null);
    fetch(`${BASE}/${slug}.json`)
      .then((r) => r.json())
      .then((json) => setHadiths(json.hadiths ?? []))
      .catch(() => setError("Couldn't load this collection. Check your connection."))
      .finally(() => setLoading(false));
  }, [lang, book]);

  const sections = useMemo(() => {
    const byBook = new Map<number, RawHadith[]>();
    for (const h of hadiths) {
      const b = h.reference?.book ?? 0;
      if (!byBook.has(b)) byBook.set(b, []);
      byBook.get(b)!.push(h);
    }
    return Array.from(byBook.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([bookNum, items]) => ({ title: `Book ${bookNum}`, data: items }));
  }, [hadiths]);

  if (!book) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Collection not found.</Text>
      </View>
    );
  }

  return (
    <ScreenBackground>
      <View style={styles.langRow}>
        <TouchableOpacity
          style={[styles.langChip, lang === "en" && styles.langChipActive]}
          onPress={() => setLang("en")}
        >
          <Text style={[styles.langChipText, lang === "en" && styles.langChipTextActive]}>English</Text>
        </TouchableOpacity>
        {book.editionUr && (
          <TouchableOpacity
            style={[styles.langChip, lang === "ur" && styles.langChipActive]}
            onPress={() => setLang("ur")}
          >
            <Text style={[styles.langChipText, lang === "ur" && styles.langChipTextActive]}>اردو (Urdu)</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.accent} />
          <Text style={styles.loadingHint}>Loading the full collection…</Text>
        </View>
      )}
      {!loading && error && (
        <View style={styles.center}>
          <Text style={styles.muted}>{error}</Text>
        </View>
      )}
      {!loading && !error && (
        <SectionList
          contentContainerStyle={styles.listContent}
          sections={sections}
          keyExtractor={(h, i) => `${h.hadithnumber}-${i}`}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{section.title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={[styles.card, theme.cardShadow]}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>Hadith {item.hadithnumber}</Text>
              </View>
              <Text style={[styles.text, lang === "ur" && styles.textRtl]}>{item.text}</Text>
            </View>
          )}
        />
      )}
    </ScreenBackground>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
    muted: { color: theme.colors.textMuted, textAlign: "center" },
    loadingHint: { color: theme.colors.textMuted, fontSize: 12, marginTop: 10 },
    langRow: { flexDirection: "row", gap: 8, padding: theme.spacing.md },
    langChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.cardBg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    langChipActive: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
    langChipText: { color: theme.colors.textMuted, fontSize: 13, fontWeight: "700" },
    langChipTextActive: { color: "white" },
    listContent: { padding: theme.spacing.md, paddingTop: 0 },
    sectionHeader: {
      backgroundColor: theme.colors.accent,
      borderRadius: theme.radius.pill,
      paddingHorizontal: 14,
      paddingVertical: 6,
      alignSelf: "flex-start",
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    sectionHeaderText: { color: "white", fontWeight: "700", fontSize: 12 },
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
    text: { fontSize: 14, color: theme.colors.textMuted, lineHeight: 21 },
    textRtl: { textAlign: "right", writingDirection: "rtl" },
  });
}
