import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../App";
import { theme } from "../theme";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

type Nav = NativeStackNavigationProp<HomeStackParamList, "QuranList">;
type Mode = "surah" | "juz";

const JUZ_NUMBERS = Array.from({ length: 30 }, (_, i) => i + 1);

export default function QuranScreen() {
  const [mode, setMode] = useState<Mode>("surah");
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/surah")
      .then((r) => r.json())
      .then((json) => setSurahs(json.data as Surah[]))
      .catch(() => setError("Couldn't load the Qur'an index. Check your connection."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.page}>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggle, mode === "surah" && styles.toggleActive]}
          onPress={() => setMode("surah")}
        >
          <Text style={[styles.toggleText, mode === "surah" && styles.toggleTextActive]}>
            Surah
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggle, mode === "juz" && styles.toggleActive]}
          onPress={() => setMode("juz")}
        >
          <Text style={[styles.toggleText, mode === "juz" && styles.toggleTextActive]}>
            Para (Juz)
          </Text>
        </TouchableOpacity>
      </View>

      {mode === "surah" ? (
        loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.accent} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.muted}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={surahs}
            keyExtractor={(s) => String(s.number)}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.row, theme.cardShadow]}
                onPress={() =>
                  navigation.navigate("SurahDetail", {
                    number: item.number,
                    englishName: item.englishName,
                  })
                }
              >
                <View style={styles.numberBadge}>
                  <Text style={styles.numberText}>{item.number}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.englishName}</Text>
                  <Text style={styles.subtitle}>
                    {item.englishNameTranslation} · {item.numberOfAyahs} ayahs ·{" "}
                    {item.revelationType}
                  </Text>
                </View>
                <Text style={styles.arabic}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )
      ) : (
        <FlatList
          data={JUZ_NUMBERS}
          keyExtractor={(n) => String(n)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, theme.cardShadow]}
              onPress={() => navigation.navigate("JuzDetail", { number: item })}
            >
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{item}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>Juz {item}</Text>
                <Text style={styles.subtitle}>Para {item} of 30</Text>
              </View>
            </TouchableOpacity>
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
  toggleRow: { flexDirection: "row", padding: theme.spacing.md, gap: theme.spacing.sm },
  toggle: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.cardBg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  toggleActive: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
  toggleText: { color: theme.colors.textMuted, fontWeight: "700", fontSize: 13 },
  toggleTextActive: { color: "white" },
  listContent: { padding: theme.spacing.md, gap: theme.spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
    gap: 12,
  },
  numberBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.pageBg,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: { color: theme.colors.accent, fontWeight: "700", fontSize: 13 },
  name: { fontSize: 16, fontWeight: "700", color: theme.colors.textPrimary },
  subtitle: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  arabic: { fontSize: 19, color: theme.colors.accent },
});
