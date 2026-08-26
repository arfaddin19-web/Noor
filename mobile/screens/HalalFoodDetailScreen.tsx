import React, { useEffect, useMemo, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import type { HomeStackParamList } from "../App";
import { supabase } from "../lib/supabase";
import { HalalFoodPlace } from "../lib/types";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

type DetailRoute = RouteProp<HomeStackParamList, "HalalFoodDetail">;

export default function HalalFoodDetailScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
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
        <ActivityIndicator color={theme.colors.accent} />
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
            <Ionicons name="restaurant-outline" size={56} color={theme.colors.textOnDarkMuted} />
          </View>
        )}

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{place.name}</Text>
            {place.halal_certified && (
              <View style={styles.badge}>
                <Ionicons name="checkmark-circle" size={13} color="#166534" />
                <Text style={styles.badgeText}>Halal Certified</Text>
              </View>
            )}
          </View>
          <Text style={styles.category}>{place.category}</Text>

          {place.address && (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={theme.colors.textMuted} />
              <Text style={styles.metaText}>{place.address}</Text>
            </View>
          )}
          {place.phone && (
            <TouchableOpacity style={styles.metaRow} onPress={() => Linking.openURL(`tel:${place.phone}`)}>
              <Ionicons name="call-outline" size={14} color={theme.colors.accent} />
              <Text style={[styles.metaText, styles.link]}>{place.phone}</Text>
            </TouchableOpacity>
          )}
          {place.description && <Text style={styles.description}>{place.description}</Text>}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.directionButton} onPress={openDirections}>
          <Ionicons name="navigate" size={18} color="white" />
          <Text style={styles.directionText}>Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.pageBg },
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
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
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
    metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
    metaText: { fontSize: 14, color: theme.colors.textMuted },
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
      ...theme.cardShadow,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: theme.colors.accent,
      borderRadius: theme.radius.pill,
      paddingVertical: 15,
    },
    directionText: { color: "white", fontWeight: "700", fontSize: 15 },
  });
}
