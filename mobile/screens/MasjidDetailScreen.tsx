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
import { Masjid, PrayerTime } from "../lib/types";
import { todayMonthDay } from "../lib/prayerLogic";
import { theme } from "../theme";

type DetailRoute = RouteProp<HomeStackParamList, "MasjidDetail">;

const PRAYER_ROWS: { label: string; adhanKey: keyof PrayerTime; jamatKey: keyof Masjid }[] = [
  { label: "Fajr", adhanKey: "fajr", jamatKey: "fajr_jamat" },
  { label: "Dhuhr", adhanKey: "dhuhr", jamatKey: "dhuhr_jamat" },
  { label: "Asr", adhanKey: "asr", jamatKey: "asr_jamat" },
  { label: "Maghrib", adhanKey: "maghrib", jamatKey: "maghrib_jamat" },
  { label: "Isha", adhanKey: "isha", jamatKey: "isha_jamat" },
];

export default function MasjidDetailScreen() {
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
        <ActivityIndicator />
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
            <Text style={{ fontSize: 56 }}>🕌</Text>
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.name}>{masjid.name}</Text>
          {masjid.address && (
            <Text style={styles.metaRow}>📍 {masjid.address}</Text>
          )}
          {masjid.phone && (
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${masjid.phone}`)}>
              <Text style={[styles.metaRow, styles.link]}>📞 {masjid.phone}</Text>
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
  name: { fontSize: 22, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: 8 },
  metaRow: { fontSize: 14, color: theme.colors.textMuted, marginBottom: 4 },
  link: { color: theme.colors.accent, fontWeight: "600" },
  description: { fontSize: 14, color: theme.colors.textMuted, marginTop: 8, lineHeight: 20 },
  table: {
    marginTop: 20,
    borderRadius: theme.radius.md,
    backgroundColor: "white",
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
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.pill,
    paddingVertical: 15,
    alignItems: "center",
  },
  directionText: { color: "white", fontWeight: "700", fontSize: 15 },
});
