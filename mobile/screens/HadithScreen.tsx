import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Free, no-key hadith API: https://github.com/fawazahmed0/hadith-api
// Response shape (per the API's documented pattern):
//   { hadiths: [{ hadithnumber, arabicnumber, text, reference: { book, hadith } }], metadata: {...} }
// Verify against the live API docs if the shape ever changes.
const BASE = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";

const COLLECTIONS = [
  { slug: "eng-bukhari", name: "Sahih al-Bukhari" },
  { slug: "eng-muslim", name: "Sahih Muslim" },
  { slug: "eng-abudawud", name: "Sunan Abu Dawud" },
  { slug: "eng-tirmidhi", name: "Jami' at-Tirmidhi" },
  { slug: "eng-nasai", name: "Sunan an-Nasa'i" },
  { slug: "eng-ibnmajah", name: "Sunan Ibn Majah" },
];

interface Hadith {
  hadithnumber: number;
  text: string;
}

export default function HadithScreen() {
  const [collection, setCollection] = useState(COLLECTIONS[0]);
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${BASE}/${collection.slug}/sections/1.json`)
      .then((r) => r.json())
      .then((json) => setHadiths((json.hadiths ?? []).slice(0, 30)))
      .catch(() => setError("Couldn't load hadiths. Check your connection."))
      .finally(() => setLoading(false));
  }, [collection]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        horizontal
        data={COLLECTIONS}
        keyExtractor={(c) => c.slug}
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
        contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setCollection(item)}
            style={[styles.chip, item.slug === collection.slug && styles.chipActive]}
          >
            <Text
              style={[
                styles.chipText,
                item.slug === collection.slug && styles.chipTextActive,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      )}
      {error && (
        <View style={styles.center}>
          <Text style={styles.muted}>{error}</Text>
        </View>
      )}
      {!loading && !error && (
        <FlatList
          data={hadiths}
          keyExtractor={(h) => String(h.hadithnumber)}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.number}>Hadith {item.hadithnumber}</Text>
              <Text style={styles.text}>{item.text}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  muted: { color: "#6b7280", textAlign: "center" },
  chipRow: { flexGrow: 0, paddingVertical: 10 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f2faf8",
  },
  chipActive: { backgroundColor: "#0e8a72" },
  chipText: { color: "#0e8a72", fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: "white" },
  card: { backgroundColor: "white", borderRadius: 12, padding: 16, marginBottom: 12 },
  number: { fontSize: 12, color: "#0e8a72", fontWeight: "700", marginBottom: 6 },
  text: { fontSize: 14, color: "#374151", lineHeight: 21 },
});
