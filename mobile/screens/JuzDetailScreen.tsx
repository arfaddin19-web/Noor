import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import type { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import type { HomeStackParamList } from "../App";
import AyahCard from "../components/AyahCard";
import TranslationToggleBar from "../components/TranslationToggleBar";
import { saveLastRead } from "../lib/quranProgress";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

interface JuzAyah {
  numberInSurah: number;
  text: string;
  surah?: { number: number; englishName: string; name: string };
}

type JuzRoute = RouteProp<HomeStackParamList, "JuzDetail">;

export default function JuzDetailScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { params } = useRoute<JuzRoute>();
  const [arabic, setArabic] = useState<JuzAyah[]>([]);
  const [translation, setTranslation] = useState<JuzAyah[]>([]);
  const [showTranslation, setShowTranslation] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    saveLastRead({ type: "juz", number: params.number, label: `Juz ${params.number}` });

    Promise.all([
      fetch(`https://api.alquran.cloud/v1/juz/${params.number}/quran-uthmani`).then((r) =>
        r.json()
      ),
      fetch(`https://api.alquran.cloud/v1/juz/${params.number}/en.sahih`).then((r) => r.json()),
    ])
      .then(([ar, en]) => {
        setArabic(ar.data.ayahs);
        setTranslation(en.data.ayahs);
      })
      .catch(() => setError("Couldn't load this Juz. Check your connection."))
      .finally(() => setLoading(false));
  }, [params.number]);

  // Mark the first ayah of each surah within this Juz, so we can show a header row.
  const rows = useMemo(
    () =>
      arabic.map((ayah, index) => ({
        ayah,
        index,
        isNewSurah: index === 0 || ayah.surah?.number !== arabic[index - 1]?.surah?.number,
      })),
    [arabic]
  );

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

  return (
    <View style={styles.page}>
      <TranslationToggleBar value={showTranslation} onValueChange={setShowTranslation} />
      <FlatList
        data={rows}
        keyExtractor={(r) => `${r.ayah.surah?.number ?? 0}-${r.ayah.numberInSurah}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View>
            {item.isNewSurah && item.ayah.surah && (
              <View style={styles.surahHeader}>
                <Text style={styles.surahHeaderText}>{item.ayah.surah.englishName}</Text>
                <Text style={styles.surahHeaderArabic}>{item.ayah.surah.name}</Text>
              </View>
            )}
            <AyahCard
              number={item.ayah.numberInSurah}
              arabicText={item.ayah.text}
              translationText={translation[item.index]?.text}
              showTranslation={showTranslation}
            />
          </View>
        )}
      />
    </View>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.colors.pageBg },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: theme.colors.pageBg },
    muted: { color: theme.colors.textMuted, textAlign: "center" },
    listContent: { padding: theme.spacing.md },
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
  });
}
