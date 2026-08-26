import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../theme";

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
    <View style={styles.page}>
      <FlatList
        horizontal
        data={COLLECTIONS}
        keyExtractor={(c) => c.slug}
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
        contentContainerStyle={styles.chipRowContent}
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
          <ActivityIndicator color={theme.colors.accent} />
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
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.card, theme.cardShadow]}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>Hadith {item.hadithnumber}</Text>
              </View>
              <Text style={styles.text}>{item.text}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.pageBg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  muted: { color: theme.colors.textMuted, textAlign: "center" },
  chipRow: { flexGrow: 0, paddingVertical: theme.spacing.md },
  chipRowContent: { paddingHorizontal: theme.spacing.md, gap: theme.spacing.sm },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.cardBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
  chipText: { color: theme.colors.textMuted, fontSize: 13, fontWeight: "700" },
  chipTextActive: { color: "white" },
  listContent: { padding: theme.spacing.md, paddingTop: 0 },
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
});
