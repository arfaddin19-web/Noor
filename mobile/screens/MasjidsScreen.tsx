import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Location from "expo-location";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../App";
import { supabase } from "../lib/supabase";
import { Masjid, JAMAT_LABELS } from "../lib/types";
import { distanceKm, formatDistance } from "../lib/geo";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

type Nav = NativeStackNavigationProp<HomeStackParamList, "Masjids">;

export default function MasjidsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [masjids, setMasjids] = useState<(Masjid & { distance: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission is needed to find masjids near you.");
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
    supabase
      .from("masjids")
      .select("*")
      .eq("is_approved", true)
      .then(({ data }) => {
        const withDist = ((data as Masjid[]) ?? [])
          .map((x) => ({ ...x, distance: distanceKm(coords.lat, coords.lng, x.latitude, x.longitude) }))
          .sort((a, b) => a.distance - b.distance);
        setMasjids(withDist);
        setLoading(false);
      });
  }, [coords]);

  return (
    <View style={styles.page}>
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
          data={masjids}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.muted}>No masjids listed nearby yet.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, theme.cardShadow]}
              onPress={() => navigation.navigate("MasjidDetail", { id: item.id })}
            >
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="mosque" size={20} color={theme.colors.accent} />
                <Text style={styles.cardTitle}>{item.name}</Text>
              </View>
              {item.address && <Text style={styles.cardSubtitle}>{item.address}</Text>}
              <View style={styles.cardMeta}>
                <Ionicons name="navigate-outline" size={13} color={theme.colors.accent} />
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
    </View>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.colors.pageBg },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
    muted: { color: theme.colors.textMuted, textAlign: "center" },
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
