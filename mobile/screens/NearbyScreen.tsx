import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import * as Location from "expo-location";
import { supabase } from "../lib/supabase";
import { Masjid, HalalFoodPlace } from "../lib/types";
import { distanceKm, formatDistance } from "../lib/geo";

type Mode = "masjids" | "halal";

export default function NearbyScreen() {
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

  function openMaps(lat: number, lng: number, label: string) {
    const url = `https://maps.google.com/?q=${lat},${lng}(${encodeURIComponent(label)})`;
    Linking.openURL(url);
  }

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
              onPress={() => openMaps(item.latitude, item.longitude, item.name)}
            >
              <Text style={styles.cardTitle}>{item.name}</Text>
              {item.address && <Text style={styles.cardSubtitle}>{item.address}</Text>}
              <View style={styles.cardMeta}>
                <Text style={styles.distance}>{formatDistance(item.distance)}</Text>
                {item.jumma_time && (
                  <Text style={styles.metaText}>Jumu'ah {item.jumma_time}</Text>
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
              onPress={() => openMaps(item.latitude, item.longitude, item.name)}
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
});
