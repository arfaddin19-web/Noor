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
import { getSurahAyahs, QuranVerse } from "../lib/quranText";
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

interface Ayah {
  numberInSurah: number;
  text: string;
}

type SurahRoute = RouteProp<HomeStackParamList, "SurahDetail">;

export default function SurahDetailScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { params } = useRoute<SurahRoute>();
  // The Arabic text is bundled locally (see lib/quranText.ts), so it's
  // available instantly with no network dependency and no way to fail —
  // only the English translation is fetched, and its loading/error state
  // stays scoped to the (optional, off-by-default) translation block below
  // rather than blocking the reader itself.
  const arabic: QuranVerse[] = useMemo(() => getSurahAyahs(params.number), [params.number]);
  const [translation, setTranslation] = useState<Ayah[]>([]);
  const [translationError, setTranslationError] = useState(false);
  const [translationLoading, setTranslationLoading] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [textSize, setTextSizeState] = useState<TextSize>("medium");
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    saveLastRead({ type: "surah", number: params.number, label: params.englishName });
    getTextSize().then(setTextSizeState);
    isBookmarked("surah", params.number).then(setBookmarked);

    setTranslationLoading(true);
    setTranslationError(false);
    fetch(`https://api.alquran.cloud/v1/surah/${params.number}/en.sahih`)
      .then((r) => r.json())
      .then((en) => setTranslation(en.data.ayahs))
      .catch(() => setTranslationError(true))
      .finally(() => setTranslationLoading(false));
  }, [params.number]);

  useFocusEffect(
    useCallback(() => {
      isBookmarked("surah", params.number).then(setBookmarked);
    }, [params.number])
  );

  async function handleToggleBookmark() {
    const now = await toggleBookmark({ type: "surah", number: params.number, label: params.englishName });
    setBookmarked(now);
  }

  async function handleCycleTextSize() {
    const next = nextTextSize(textSize);
    setTextSizeState(next);
    await setTextSize(next);
  }

  async function handleShare() {
    const body = arabic.map((a) => a.text).join(" ");
    await Share.share({ message: `${params.englishName}\n\n${body}\n\n— shared from Noor` });
  }

  return (
    <View style={styles.page}>
      <QuranReaderTopBar leftLabel={`Surah ${params.number}`} rightLabel={params.englishName} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MushafText
          ayahs={arabic.map((a) => ({ number: a.numberInSurah, text: a.text }))}
          fontSize={arabicFontSizeFor(textSize)}
          lineHeight={arabicLineHeightFor(textSize)}
        />
        {showTranslation && (
          <View style={styles.translationBlock}>
            {translationLoading ? (
              <ActivityIndicator color={theme.colors.accent} />
            ) : translationError ? (
              <Text style={styles.muted}>Couldn't load the translation. Check your connection.</Text>
            ) : (
              arabic.map((a, i) => (
                <View key={i} style={styles.translationRow}>
                  <Text style={styles.translationNumber}>{a.numberInSurah}.</Text>
                  <Text style={styles.translationText}>{translation[i]?.text}</Text>
                </View>
              ))
            )}
          </View>
        )}
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
    translationBlock: {
      marginTop: theme.spacing.lg,
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
