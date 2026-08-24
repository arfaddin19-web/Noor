import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import type { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import type { QuranStackParamList } from "../App";

interface Ayah {
  numberInSurah: number;
  text: string;
}

type SurahRoute = RouteProp<QuranStackParamList, "SurahDetail">;

export default function SurahDetailScreen() {
  const { params } = useRoute<SurahRoute>();
  const [arabic, setArabic] = useState<Ayah[]>([]);
  const [translation, setTranslation] = useState<Ayah[]>([]);
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
        <ActivityIndicator />
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
    <FlatList
      data={arabic}
      keyExtractor={(a) => String(a.numberInSurah)}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item, index }) => (
        <View style={styles.ayahCard}>
          <Text style={styles.ayahNumber}>{item.numberInSurah}</Text>
          <Text style={styles.arabicText}>{item.text}</Text>
          <Text style={styles.translationText}>{translation[index]?.text}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  muted: { color: "#6b7280", textAlign: "center" },
  ayahCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  ayahNumber: {
    fontSize: 12,
    color: "#0e8a72",
    fontWeight: "700",
    marginBottom: 8,
  },
  arabicText: {
    fontSize: 22,
    textAlign: "right",
    lineHeight: 38,
    color: "#111827",
    marginBottom: 10,
  },
  translationText: { fontSize: 14, color: "#4b5563", lineHeight: 20 },
});
