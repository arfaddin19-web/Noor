import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import type { HomeStackParamList } from "../App";
import { supabase } from "../lib/supabase";
import { HalalFoodPlace } from "../lib/types";
import { theme } from "../theme";

type DetailRoute = RouteProp<HomeStackParamList, "HalalFoodDetail">;

export default function HalalFoodDetailScreen() {
  const { params } = useRoute<DetailRoute>();
  const [place, setPlace] = useState<HalalFoodPlace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("halal_food_places")
        .select("*")
        .eq("id", params.id)
        .single();
      setPlace((data as HalalFoodPlace) ?? null);
      setLoading(false);
    })();
  }, [params.id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!place) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Place not found.</Text>
      </View>
    );
  }

  function openDirections() {
    if (!place) return;
    const url = `https://maps.google.com/?q=${place.latitude},${place.longitude}(${encodeURIComponent(place.name)})`;
    Linking.openURL(url);
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.pageBg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {place.photo_url ? (
          <Image source={{ uri: place.photo_url }} style={styles.hero} />
        ) : (
          <View style={[styles.hero, styles.heroPlaceholder]}>
            <Text style={{ fontSize: 56 }}>🍽️</Text>
          </View>
        )}

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{place.name}</Text>
            {place.halal_certified && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✅ Halal Certified</Text>
              </View>
            )}
          </View>
          <Text style={styles.category}>{place.category}</Text>

          {place.address && <Text style={styles.metaRow}>📍 {place.address}</Text>}
          {place.phone && (
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${place.phone}`)}>
              <Text style={[styles.metaRow, styles.link]}>📞 {place.phone}</Text>
            </TouchableOpacity>
          )}
          {place.description && <Text style={styles.description}>{place.description}</Text>}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.directionButton} onPress={openDirections}>
          <Text style={styles.directionText}>🧭  Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  muted: { color: theme.colors.textMuted },
  hero: { width: "100%", height: 220 },
  heroPlaceholder: {
    backgroundColor: theme.colors.skyMid,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { padding: 20 },
  titleRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 10 },
  name: { fontSize: 22, fontWeight: "700", color: theme.colors.textPrimary },
  badge: {
    backgroundColor: "#dcfce7",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { color: "#166534", fontSize: 11, fontWeight: "700" },
  category: {
    fontSize: 13,
    color: theme.colors.accent,
    fontWeight: "600",
    textTransform: "capitalize",
    marginTop: 4,
    marginBottom: 8,
  },
  metaRow: { fontSize: 14, color: theme.colors.textMuted, marginBottom: 4 },
  link: { color: theme.colors.accent, fontWeight: "600" },
  description: { fontSize: 14, color: theme.colors.textMuted, marginTop: 8, lineHeight: 20 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: theme.colors.pageBg,
  },
  directionButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.pill,
    paddingVertical: 15,
    alignItems: "center",
  },
  directionText: { color: "white", fontWeight: "700", fontSize: 15 },
});
