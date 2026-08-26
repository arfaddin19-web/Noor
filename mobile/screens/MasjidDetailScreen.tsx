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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import type { HomeStackParamList } from "../App";
import { supabase } from "../lib/supabase";
import { Masjid, PrayerTime } from "../lib/types";
import { todayMonthDay } from "../lib/prayerLogic";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

type DetailRoute = RouteProp<HomeStackParamList, "MasjidDetail">;

const PRAYER_ROWS: { label: string; adhanKey: keyof PrayerTime; jamatKey: keyof Masjid }[] = [
  { label: "Fajr", adhanKey: "fajr", jamatKey: "fajr_jamat" },
  { label: "Dhuhr", adhanKey: "dhuhr", jamatKey: "dhuhr_jamat" },
  { label: "Asr", adhanKey: "asr", jamatKey: "asr_jamat" },
  { label: "Maghrib", adhanKey: "maghrib", jamatKey: "maghrib_jamat" },
  { label: "Isha", adhanKey: "isha", jamatKey: "isha_jamat" },
];

export default function MasjidDetailScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { params } = useRoute<DetailRoute>();
  const [masjid, setMasjid] = useState<Masjid | null>(null);
  const [adhan, setAdhan] = useState<PrayerTime | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: m } = await supabase
        .from("masjids")
        .select("*")
        .eq("id", params.id)
        .single();
      setMasjid((m as Masjid) ?? null);

      const { data: loc } = await supabase
        .from("locations")
        .select("id")
        .eq("is_default", true)
        .single();
      if (loc) {
        const { month, day } = todayMonthDay();
        const { data: p } = await supabase
          .from("prayer_times")
          .select("*")
          .eq("location_id", loc.id)
          .eq("month", month)
          .eq("day", day)
          .maybeSingle();
        setAdhan((p as PrayerTime) ?? null);
      }
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

  if (!masjid) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Masjid not found.</Text>
      </View>
    );
  }

  function openDirections() {
    if (!masjid) return;
    const url = `https://maps.google.com/?q=${masjid.latitude},${masjid.longitude}(${encodeURIComponent(masjid.name)})`;
    Linking.openURL(url);
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.pageBg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {masjid.photo_url ? (
          <Image source={{ uri: masjid.photo_url }} style={styles.hero} />
        ) : (
          <View style={[styles.hero, styles.heroPlaceholder]}>
            <MaterialCommunityIcons name="mosque" size={56} color={theme.colors.textOnDarkMuted} />
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.name}>{masjid.name}</Text>
          {masjid.address && (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={theme.colors.textMuted} />
              <Text style={styles.metaText}>{masjid.address}</Text>
            </View>
          )}
          {masjid.phone && (
            <TouchableOpacity style={styles.metaRow} onPress={() => Linking.openURL(`tel:${masjid.phone}`)}>
              <Ionicons name="call-outline" size={14} color={theme.colors.accent} />
              <Text style={[styles.metaText, styles.link]}>{masjid.phone}</Text>
            </TouchableOpacity>
          )}
          {masjid.description && <Text style={styles.description}>{masjid.description}</Text>}

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>Prayer</Text>
              <Text style={styles.tableHeaderCell}>Azan</Text>
              <Text style={styles.tableHeaderCell}>Iqama</Text>
            </View>
            {PRAYER_ROWS.map((row) => (
              <View key={row.label} style={styles.tableRow}>
                <Text style={[styles.tableCellLabel, { flex: 1.2 }]}>{row.label}</Text>
                <Text style={styles.tableCell}>
                  {adhan ? (adhan[row.adhanKey] as string) : "—"}
                </Text>
                <Text style={styles.tableCell}>
                  {(masjid[row.jamatKey] as string | null) ?? "—"}
                </Text>
              </View>
            ))}
            {masjid.jumma_jamat && (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCellLabel, { flex: 1.2 }]}>Jumu'ah</Text>
                <Text style={styles.tableCell}>—</Text>
                <Text style={styles.tableCell}>{masjid.jumma_jamat}</Text>
              </View>
            )}
          </View>
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
    name: { fontSize: 22, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: 8 },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
    metaText: { fontSize: 14, color: theme.colors.textMuted },
    link: { color: theme.colors.accent, fontWeight: "600" },
    description: { fontSize: 14, color: theme.colors.textMuted, marginTop: 8, lineHeight: 20 },
    table: {
      marginTop: 20,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.cardBg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: "hidden",
    },
    tableHeaderRow: {
      flexDirection: "row",
      backgroundColor: theme.colors.skyMid,
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    tableHeaderCell: { flex: 1, color: "white", fontWeight: "700", fontSize: 12 },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    tableCellLabel: { flex: 1, fontWeight: "600", color: theme.colors.textPrimary, fontSize: 13 },
    tableCell: { flex: 1, color: theme.colors.textMuted, fontSize: 13 },
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
