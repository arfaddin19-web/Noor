import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../App";
import { supabase } from "../lib/supabase";
import { Masjid, HalalFoodPlace, JAMAT_LABELS } from "../lib/types";
import { distanceKm, formatDistance } from "../lib/geo";

type Nav = NativeStackNavigationProp<HomeStackParamList, "Nearby">;

type Mode = "masjids" | "halal";

export default function NearbyScreen() {
  const navigation = useNavigation<Nav>();
  const [mode, setMode] = useState<Mode>("masjids");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [masjids, setMasjids] = useState<(Masjid & { distance: number })[]>([]);
  const [food, setFood] = useState<(HalalFoodPlace & { distance: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission is needed to find what's near you.");
        setLoading(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    })();
  }, []);

  useEffect(() => {
    if (!coords) return;
    setLoading(true);
    Promise.all([
      supabase.from("masjids").select("*").eq("is_approved", true),
      supabase.from("halal_food_places").select("*").eq("is_approved", true),
    ]).then(([m, f]) => {
      const withDistM = ((m.data as Masjid[]) ?? [])
        .map((x) => ({ ...x, distance: distanceKm(coords.lat, coords.lng, x.latitude, x.longitude) }))
        .sort((a, b) => a.distance - b.distance);
      const withDistF = ((f.data as HalalFoodPlace[]) ?? [])
        .map((x) => ({ ...x, distance: distanceKm(coords.lat, coords.lng, x.latitude, x.longitude) }))
        .sort((a, b) => a.distance - b.distance);
      setMasjids(withDistM);
      setFood(withDistF);
      setLoading(false);
    });
  }, [coords]);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggle, mode === "masjids" && styles.toggleActive]}
          onPress={() => setMode("masjids")}
        >
          <Text style={[styles.toggleText, mode === "masjids" && styles.toggleTextActive]}>
            🕌 Masjids
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggle, mode === "halal" && styles.toggleActive]}
          onPress={() => setMode("halal")}
        >
          <Text style={[styles.toggleText, mode === "halal" && styles.toggleTextActive]}>
            🍽️ Halal Food
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.center}>
          <Text style={styles.muted}>{error}</Text>
        </View>
      )}
      {!error && loading && (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      )}
      {!error && !loading && mode === "masjids" && (
        <FlatList
          data={masjids}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.muted}>No masjids listed nearby yet.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("MasjidDetail", { id: item.id })}
            >
              <Text style={styles.cardTitle}>{item.name}</Text>
              {item.address && <Text style={styles.cardSubtitle}>{item.address}</Text>}
              <View style={styles.cardMeta}>
                <Text style={styles.distance}>{formatDistance(item.distance)}</Text>
              </View>
              <View style={styles.jamatRow}>
                {JAMAT_LABELS.map(({ key, label }) =>
                  item[key] ? (
                    <View key={key} style={styles.jamatChip}>
                      <Text style={styles.jamatLabel}>{label}</Text>
                      <Text style={styles.jamatTime}>{item[key]}</Text>
                    </View>
                  ) : null
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      {!error && !loading && mode === "halal" && (
        <FlatList
          data={food}
          keyExtractor={(f) => f.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.muted}>No halal food places listed nearby yet.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("HalalFoodDetail", { id: item.id })}
            >
              <Text style={styles.cardTitle}>
                {item.name} {item.halal_certified ? "✅" : ""}
              </Text>
              {item.address && <Text style={styles.cardSubtitle}>{item.address}</Text>}
              <View style={styles.cardMeta}>
                <Text style={styles.distance}>{formatDistance(item.distance)}</Text>
                <Text style={styles.metaText}>{item.category}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  muted: { color: "#6b7280", textAlign: "center" },
  toggleRow: { flexDirection: "row", padding: 12, gap: 8 },
  toggle: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f2faf8",
    alignItems: "center",
  },
  toggleActive: { backgroundColor: "#0e8a72" },
  toggleText: { color: "#0e8a72", fontWeight: "600" },
  toggleTextActive: { color: "white" },
  card: { backgroundColor: "white", borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  cardSubtitle: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  cardMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  distance: { color: "#0e8a72", fontWeight: "700", fontSize: 13 },
  metaText: { color: "#6b7280", fontSize: 13, textTransform: "capitalize" },
  jamatRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  jamatChip: {
    backgroundColor: "#f2faf8",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
  },
  jamatLabel: { fontSize: 10, color: "#0e8a72", fontWeight: "600" },
  jamatTime: { fontSize: 12, color: "#111827", fontWeight: "600" },
});
