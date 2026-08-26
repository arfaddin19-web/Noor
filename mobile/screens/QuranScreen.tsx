import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../App";
import StarBadge from "../components/StarBadge";
import { getLastRead, LastRead } from "../lib/quranProgress";
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
type Mode = "surah" | "page" | "juz";

const JUZ_NUMBERS = Array.from({ length: 30 }, (_, i) => i + 1);
const PAGE_NUMBERS = Array.from({ length: 604 }, (_, i) => i + 1);

export default function QuranScreen() {
  const [mode, setMode] = useState<Mode>("surah");
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [lastRead, setLastRead] = useState<LastRead | null>(null);
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

  useFocusEffect(
    useCallback(() => {
      getLastRead().then(setLastRead);
    }, [])
  );

  function openLastRead() {
    if (!lastRead) return;
    if (lastRead.type === "surah") {
      navigation.navigate("SurahDetail", { number: lastRead.number, englishName: lastRead.label });
    } else if (lastRead.type === "juz") {
      navigation.navigate("JuzDetail", { number: lastRead.number });
    } else {
      navigation.navigate("PageDetail", { number: lastRead.number });
    }
  }

  return (
    <View style={styles.page}>
      {lastRead && (
        <TouchableOpacity style={[styles.lastReadCard, theme.cardShadow]} onPress={openLastRead}>
          <StarBadge number={lastRead.number} size={40} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.lastReadLabel}>Last Read</Text>
            <Text style={styles.lastReadTitle}>{lastRead.label}</Text>
          </View>
          <Text style={styles.lastReadIcon}>📖</Text>
        </TouchableOpacity>
      )}

      <View style={styles.toggleRow}>
        {(["surah", "page", "juz"] as Mode[]).map((m) => (
          <TouchableOpacity key={m} style={styles.toggleTab} onPress={() => setMode(m)}>
            <Text style={[styles.toggleText, mode === m && styles.toggleTextActive]}>
              {m === "surah" ? "Sura" : m === "page" ? "Page" : "Juz"}
            </Text>
            {mode === m && <View style={styles.toggleUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {mode === "surah" &&
        (loading ? (
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
                <StarBadge number={item.number} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.name}>{item.englishName}</Text>
                  <Text style={styles.subtitle}>{item.englishNameTranslation}</Text>
                </View>
                <Text style={styles.revelation}>
                  {item.revelationType === "Meccan" ? "Meccan" : "Median"}
                </Text>
              </TouchableOpacity>
            )}
          />
        ))}

      {mode === "juz" && (
        <FlatList
          data={JUZ_NUMBERS}
          keyExtractor={(n) => String(n)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, theme.cardShadow]}
              onPress={() => navigation.navigate("JuzDetail", { number: item })}
            >
              <StarBadge number={item} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.name}>Juz {item}</Text>
                <Text style={styles.subtitle}>Para {item} of 30</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {mode === "page" && (
        <FlatList
          data={PAGE_NUMBERS}
          keyExtractor={(n) => String(n)}
          numColumns={4}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.pageTile, theme.cardShadow]}
              onPress={() => navigation.navigate("PageDetail", { number: item })}
            >
              <Text style={styles.pageTileText}>{item}</Text>
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
  lastReadCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    marginBottom: 0,
  },
  lastReadLabel: { fontSize: 11, color: theme.colors.textMuted, fontWeight: "700" },
  lastReadTitle: { fontSize: 17, fontWeight: "800", color: theme.colors.textPrimary, marginTop: 2 },
  lastReadIcon: { fontSize: 22, opacity: 0.35 },
  toggleRow: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  toggleTab: { paddingVertical: 12, marginRight: 28, alignItems: "center" },
  toggleText: { fontSize: 14, fontWeight: "700", color: theme.colors.textMuted },
  toggleTextActive: { color: theme.colors.accent },
  toggleUnderline: {
    marginTop: 8,
    height: 3,
    width: 28,
    borderRadius: 2,
    backgroundColor: theme.colors.accent,
  },
  listContent: { padding: theme.spacing.md, gap: theme.spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
  },
  name: { fontSize: 16, fontWeight: "700", color: theme.colors.textPrimary },
  subtitle: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  revelation: { fontSize: 12, color: theme.colors.textMuted, fontWeight: "600" },
  pageTile: {
    flex: 1,
    margin: 5,
    aspectRatio: 1,
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  pageTileText: { fontSize: 14, fontWeight: "700", color: theme.colors.accent },
});
