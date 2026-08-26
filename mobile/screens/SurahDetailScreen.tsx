import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import type { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import type { HomeStackParamList } from "../App";
import AyahCard from "../components/AyahCard";
import TranslationToggleBar from "../components/TranslationToggleBar";
import { theme } from "../theme";

interface Ayah {
  numberInSurah: number;
  text: string;
}

type SurahRoute = RouteProp<HomeStackParamList, "SurahDetail">;

export default function SurahDetailScreen() {
  const { params } = useRoute<SurahRoute>();
  const [arabic, setArabic] = useState<Ayah[]>([]);
  const [translation, setTranslation] = useState<Ayah[]>([]);
  const [showTranslation, setShowTranslation] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${params.number}`).then((r) => r.json()),
      fetch(`https://api.alquran.cloud/v1/surah/${params.number}/en.sahih`).then((r) =>
        r.json()
      ),
    ])
      .then(([ar, en]) => {
        setArabic(ar.data.ayahs);
        setTranslation(en.data.ayahs);
      })
      .catch(() => setError("Couldn't load this surah. Check your connection."))
      .finally(() => setLoading(false));
  }, [params.number]);

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
        data={arabic}
        keyExtractor={(a) => String(a.numberInSurah)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <AyahCard
            number={item.numberInSurah}
            arabicText={item.text}
            translationText={translation[index]?.text}
            showTranslation={showTranslation}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.pageBg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  muted: { color: theme.colors.textMuted, textAlign: "center" },
  listContent: { padding: theme.spacing.md },
});
