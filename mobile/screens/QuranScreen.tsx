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

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

type Nav = NativeStackNavigationProp<HomeStackParamList, "QuranList">;

export default function QuranScreen() {
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
      data={surahs}
      keyExtractor={(s) => String(s.number)}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.row}
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
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  muted: { color: "#6b7280", textAlign: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
    gap: 12,
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f2faf8",
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: { color: "#0e8a72", fontWeight: "700", fontSize: 13 },
  name: { fontSize: 16, fontWeight: "600", color: "#111827" },
  subtitle: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  arabic: { fontSize: 18, color: "#0e8a72" },
});
