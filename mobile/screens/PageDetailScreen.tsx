import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import type { RouteProp } from "@react-navigation/native";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import type { HomeStackParamList } from "../App";
import MushafText from "../components/MushafText";
import QuranReaderTopBar from "../components/QuranReaderTopBar";
import QuranReaderToolbar from "../components/QuranReaderToolbar";
import { saveLastRead } from "../lib/quranProgress";
import { isBookmarked, toggleBookmark } from "../lib/quranBookmarks";
import {
  arabicFontSizeFor,
  arabicLineHeightFor,
  getTextSize,
  nextTextSize,
  setTextSize,
  TextSize,
} from "../lib/quranTextSize";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

interface PageAyah {
  numberInSurah: number;
  text: string;
  surah?: { number: number; englishName: string; name: string };
}

type PageRoute = RouteProp<HomeStackParamList, "PageDetail">;

export default function PageDetailScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { params } = useRoute<PageRoute>();
  const [arabic, setArabic] = useState<PageAyah[]>([]);
  const [translation, setTranslation] = useState<PageAyah[]>([]);
  const [showTranslation, setShowTranslation] = useState(false);
  const [textSize, setTextSizeState] = useState<TextSize>("medium");
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const label = `Page ${params.number}`;

  useEffect(() => {
    saveLastRead({ type: "page", number: params.number, label });
    getTextSize().then(setTextSizeState);
    isBookmarked("page", params.number).then(setBookmarked);

    Promise.all([
      fetch(`https://api.alquran.cloud/v1/page/${params.number}/quran-uthmani`).then((r) =>
        r.json()
      ),
      fetch(`https://api.alquran.cloud/v1/page/${params.number}/en.sahih`).then((r) =>
        r.json()
      ),
    ])
      .then(([ar, en]) => {
        setArabic(ar.data.ayahs);
        setTranslation(en.data.ayahs);
      })
      .catch(() => setError("Couldn't load this page. Check your connection."))
      .finally(() => setLoading(false));
  }, [params.number]);

  useFocusEffect(
    useCallback(() => {
      isBookmarked("page", params.number).then(setBookmarked);
    }, [params.number])
  );

  const segments = useMemo(() => {
    const groups: { surahName: string; surahArabic: string; ayahs: PageAyah[] }[] = [];
    arabic.forEach((ayah) => {
      const last = groups[groups.length - 1];
      if (last && last.surahName === ayah.surah?.englishName) {
        last.ayahs.push(ayah);
      } else {
        groups.push({
          surahName: ayah.surah?.englishName ?? "",
          surahArabic: ayah.surah?.name ?? "",
          ayahs: [ayah],
        });
      }
    });
    return groups;
  }, [arabic]);

  const firstSurahName = arabic[0]?.surah?.englishName ?? "";

  async function handleToggleBookmark() {
    const now = await toggleBookmark({ type: "page", number: params.number, label });
    setBookmarked(now);
  }

  async function handleCycleTextSize() {
    const next = nextTextSize(textSize);
    setTextSizeState(next);
    await setTextSize(next);
  }

  async function handleShare() {
    const body = arabic.map((a) => a.text).join(" ");
    await Share.share({ message: `${label}\n\n${body}\n\n— shared from Noor` });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{error}</Text>
      </View>
    );
  }

  let runningIndex = 0;

  return (
    <View style={styles.page}>
      <QuranReaderTopBar leftLabel={label} rightLabel={firstSurahName} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {segments.map((seg, i) => {
          const startIndex = runningIndex;
          runningIndex += seg.ayahs.length;
          return (
            <View key={i}>
              <View style={styles.surahHeader}>
                <Text style={styles.surahHeaderText}>{seg.surahName}</Text>
                <Text style={styles.surahHeaderArabic}>{seg.surahArabic}</Text>
              </View>
              <MushafText
                ayahs={seg.ayahs.map((a) => ({ number: a.numberInSurah, text: a.text }))}
                fontSize={arabicFontSizeFor(textSize)}
                lineHeight={arabicLineHeightFor(textSize)}
              />
              {showTranslation && (
                <View style={styles.translationBlock}>
                  {seg.ayahs.map((a, j) => (
                    <View key={j} style={styles.translationRow}>
                      <Text style={styles.translationNumber}>{a.numberInSurah}.</Text>
                      <Text style={styles.translationText}>
                        {translation[startIndex + j]?.text}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
      <QuranReaderToolbar
        bookmarked={bookmarked}
        onToggleBookmark={handleToggleBookmark}
        onShare={handleShare}
        showTranslation={showTranslation}
        onToggleTranslation={() => setShowTranslation((v) => !v)}
        textSizeLabel={textSize[0].toUpperCase() + textSize.slice(1)}
        onCycleTextSize={handleCycleTextSize}
      />
    </View>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.colors.pageBg },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: theme.colors.pageBg },
    muted: { color: theme.colors.textMuted, textAlign: "center" },
    scrollContent: { padding: theme.spacing.lg },
    surahHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.accent,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 10,
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    surahHeaderText: { color: "white", fontWeight: "700", fontSize: 14 },
    surahHeaderArabic: { color: "white", fontSize: 16 },
    translationBlock: {
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      gap: 10,
    },
    translationRow: { flexDirection: "row", gap: 8 },
    translationNumber: { fontSize: 12, fontWeight: "700", color: theme.colors.accent, width: 20 },
    translationText: { flex: 1, fontSize: 13, color: theme.colors.textMuted, lineHeight: 20 },
  });
}
