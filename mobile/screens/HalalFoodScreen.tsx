import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../App";
import ScreenBackground from "../components/ScreenBackground";
import { supabase } from "../lib/supabase";
import { HalalFoodPlace } from "../lib/types";
import { distanceKm, formatDistance } from "../lib/geo";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

type Nav = NativeStackNavigationProp<HomeStackParamList, "HalalFood">;

export default function HalalFoodScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [food, setFood] = useState<(HalalFoodPlace & { distance: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission is needed to find halal food near you.");
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
      .from("halal_food_places")
      .select("*")
      .eq("is_approved", true)
      .then(({ data }) => {
        const withDist = ((data as HalalFoodPlace[]) ?? [])
          .map((x) => ({ ...x, distance: distanceKm(coords.lat, coords.lng, x.latitude, x.longitude) }))
          .sort((a, b) => a.distance - b.distance);
        setFood(withDist);
        setLoading(false);
      });
  }, [coords]);

  return (
    <ScreenBackground style={styles.page}>
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
          data={food}
          keyExtractor={(f) => f.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.muted}>No halal food places listed nearby yet.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, theme.cardShadow]}
              onPress={() => navigation.navigate("HalalFoodDetail", { id: item.id })}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="restaurant-outline" size={20} color={theme.colors.accent} />
                <Text style={styles.cardTitle}>{item.name}</Text>
                {item.halal_certified && (
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.accent} />
                )}
              </View>
              {item.address && <Text style={styles.cardSubtitle}>{item.address}</Text>}
              <View style={styles.cardMeta}>
                <View style={styles.distanceRow}>
                  <Ionicons name="navigate-outline" size={13} color={theme.colors.accent} />
                  <Text style={styles.distance}>{formatDistance(item.distance)}</Text>
                </View>
                <Text style={styles.metaText}>{item.category}</Text>
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
    listContent: { padding: theme.spacing.md },
    card: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
    cardTitle: { fontSize: 16, fontWeight: "700", color: theme.colors.textPrimary, flexShrink: 1 },
    cardSubtitle: { fontSize: 13, color: theme.colors.textMuted, marginTop: 4, marginLeft: 28 },
    cardMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
    distanceRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    distance: { color: theme.colors.accent, fontWeight: "700", fontSize: 13 },
    metaText: { color: theme.colors.textMuted, fontSize: 13, textTransform: "capitalize" },
  });
}
