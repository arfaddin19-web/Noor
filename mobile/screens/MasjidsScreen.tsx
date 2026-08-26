import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Location from "expo-location";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../App";
import ScreenBackground from "../components/ScreenBackground";
import { supabase } from "../lib/supabase";
import { Masjid, JAMAT_LABELS } from "../lib/types";
import { distanceKm, formatDistance } from "../lib/geo";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

type Nav = NativeStackNavigationProp<HomeStackParamList, "Masjids">;
type MasjidWithDistance = Masjid & { distance: number | null };

export default function MasjidsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [masjids, setMasjids] = useState<Masjid[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // The list itself doesn't depend on location — someone browsing masjids in a
  // city they haven't traveled to yet should still see everything, just
  // without a distance shown.
  useEffect(() => {
    supabase
      .from("masjids")
      .select("*")
      .eq("is_approved", true)
      .then(({ data, error: err }) => {
        if (err) setError("Couldn't load masjids. Check your connection.");
        setMasjids((data as Masjid[]) ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return; // fine — list still works, just without distances
      const pos = await Location.getCurrentPositionAsync({});
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    })();
  }, []);

  const withDistance: MasjidWithDistance[] = useMemo(
    () =>
      masjids.map((m) => ({
        ...m,
        distance: coords ? distanceKm(coords.lat, coords.lng, m.latitude, m.longitude) : null,
      })),
    [masjids, coords]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? withDistance.filter(
          (m) =>
            m.city?.toLowerCase().includes(q) ||
            m.address?.toLowerCase().includes(q) ||
            m.name.toLowerCase().includes(q)
        )
      : withDistance;
    return [...list].sort((a, b) => {
      if (a.distance != null && b.distance != null) return a.distance - b.distance;
      if (a.distance != null) return -1;
      if (b.distance != null) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [withDistance, query]);

  return (
    <ScreenBackground style={styles.page}>
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={theme.colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by city (e.g. Kathmandu, Pokhara)…"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.searchInput}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={styles.center}>
          <Text style={styles.muted}>{error}</Text>
        </View>
      )}
      {!error && loading && (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.accent} />
        </View>
      )}
      {!error && !loading && (
        <FlatList
          data={filtered}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.muted}>
              {query ? `No masjids found for "${query}".` : "No masjids listed yet."}
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, theme.cardShadow]}
              onPress={() => navigation.navigate("MasjidDetail", { id: item.id })}
            >
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="mosque" size={20} color={theme.colors.accent} />
                <Text style={styles.cardTitle}>{item.name}</Text>
              </View>
              {(item.city || item.address) && (
                <Text style={styles.cardSubtitle}>
                  {[item.city, item.address].filter(Boolean).join(" — ")}
                </Text>
              )}
              {item.distance != null && (
                <View style={styles.cardMeta}>
                  <Ionicons name="navigate-outline" size={13} color={theme.colors.accent} />
                  <Text style={styles.distance}>{formatDistance(item.distance)}</Text>
                </View>
              )}
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
    </ScreenBackground>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: "transparent" },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
    muted: { color: theme.colors.textMuted, textAlign: "center" },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.radius.pill,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchInput: { flex: 1, fontSize: 14, color: theme.colors.textPrimary, padding: 0 },
    listContent: { padding: theme.spacing.md },
    card: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
    cardTitle: { fontSize: 16, fontWeight: "700", color: theme.colors.textPrimary },
    cardSubtitle: { fontSize: 13, color: theme.colors.textMuted, marginTop: 4, marginLeft: 28 },
    cardMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 10 },
    distance: { color: theme.colors.accent, fontWeight: "700", fontSize: 13 },
    jamatRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
    jamatChip: {
      backgroundColor: theme.colors.pageBg,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      alignItems: "center",
    },
    jamatLabel: { fontSize: 10, color: theme.colors.accent, fontWeight: "600" },
    jamatTime: { fontSize: 12, color: theme.colors.textPrimary, fontWeight: "600" },
  });
}
