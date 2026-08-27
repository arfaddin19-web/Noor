import React, { useMemo } from "react";
import { ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { HomeStackParamList } from "../App";
import ScreenBackground from "../components/ScreenBackground";
import { getBzChapter } from "../lib/bahishtiZewar";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

type Route = RouteProp<HomeStackParamList, "BahishtiZewarChapter">;

export default function BahishtiZewarChapterScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { params } = useRoute<Route>();
  const chapter = getBzChapter(params.id);

  async function handleShare() {
    if (!chapter) return;
    await Share.share({
      message: `${chapter.title} — Bahishti Zewar\n\n${chapter.text.slice(0, 1500)}\n\n— shared from Noor`,
    });
  }

  if (!chapter) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Chapter not found.</Text>
      </View>
    );
  }

  const paragraphs = chapter.text.split("\n\n").filter((p) => p.trim());

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{chapter.title}</Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Ionicons name="share-outline" size={18} color={theme.colors.accent} />
          </TouchableOpacity>
        </View>
        {chapter.id === 0 && (
          <View style={styles.noteCard}>
            <Text style={styles.noteText}>
              Digitized from a scanned edition (Maulana Muhammad Mahomedy's translation,
              Zam Zam Publishers) via its OCR text layer, split into chapters by the book's
              own section headings. Occasional word-order glitches from the original's
              two-column layout are possible — the content itself hasn't been altered or
              re-translated. A Nepali/Hindi translation is a planned follow-on, pending a
              scholar's review before being shown as authoritative.
            </Text>
          </View>
        )}
        {paragraphs.map((p, i) => (
          <Text key={i} style={styles.paragraph}>
            {p}
          </Text>
        ))}
      </ScrollView>
    </ScreenBackground>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: theme.colors.pageBg },
    muted: { color: theme.colors.textMuted, textAlign: "center" },
    scrollContent: { padding: theme.spacing.lg },
    headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: theme.spacing.md },
    title: { flex: 1, fontSize: 20, fontWeight: "700", color: theme.colors.textPrimary },
    shareButton: { padding: 4 },
    noteCard: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    noteText: { fontSize: 12, color: theme.colors.textMuted, lineHeight: 18 },
    paragraph: {
      fontSize: 15,
      lineHeight: 24,
      color: theme.colors.textPrimary,
      marginBottom: 14,
    },
  });
}
