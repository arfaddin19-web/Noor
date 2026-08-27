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
import { getJamatForDate, TodayJamat } from "../lib/masjidJamat";
import { formatTime12h } from "../lib/timeFormat";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

type DetailRoute = RouteProp<HomeStackParamList, "MasjidDetail">;

const PRAYER_ROWS: { label: string; adhanKey: keyof PrayerTime; jamatKey: keyof Masjid; jamatTodayKey: keyof TodayJamat }[] = [
  { label: "Fajr", adhanKey: "fajr", jamatKey: "fajr_jamat", jamatTodayKey: "fajr" },
  { label: "Dhuhr", adhanKey: "dhuhr", jamatKey: "dhuhr_jamat", jamatTodayKey: "dhuhr" },
  { label: "Asr", adhanKey: "asr", jamatKey: "asr_jamat", jamatTodayKey: "asr" },
  { label: "Maghrib", adhanKey: "maghrib", jamatKey: "maghrib_jamat", jamatTodayKey: "maghrib" },
  { label: "Isha", adhanKey: "isha", jamatKey: "isha_jamat", jamatTodayKey: "isha" },
];

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export default function MasjidDetailScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { params } = useRoute<DetailRoute>();
  const [masjid, setMasjid] = useState<Masjid | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [adhan, setAdhan] = useState<PrayerTime | null>(null);
  const [dayJamat, setDayJamat] = useState<TodayJamat | null>(null);
  const [loading, setLoading] = useState(true);
  const [dayLoading, setDayLoading] = useState(false);
  // 0 = today, +1 = tomorrow, -1 = yesterday, etc. — lets you browse any
  // day's Azan/Iqama times, not just today's.
  const [dayOffset, setDayOffset] = useState(0);

  const viewDate = useMemo(() => addDays(new Date(), dayOffset), [dayOffset]);

  // Masjid details + the default location only need loading once.
  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: m }, { data: loc }] = await Promise.all([
        supabase.from("masjids").select("*").eq("id", params.id).single(),
        supabase.from("locations").select("id").eq("is_default", true).single(),
      ]);
      setMasjid((m as Masjid) ?? null);
      setLocationId((loc as { id: string } | null)?.id ?? null);
      setLoading(false);
    })();
  }, [params.id]);

  // Azan/Iqama times depend on which day is being viewed.
  useEffect(() => {
    if (!locationId) return;
    (async () => {
      setDayLoading(true);
      const { month, day } = todayMonthDay(viewDate);
      const [{ data: p }, jamat] = await Promise.all([
        supabase
          .from("prayer_times")
          .select("*")
          .eq("location_id", locationId)
          .eq("month", month)
          .eq("day", day)
          .maybeSingle(),
        // Prefer this day's exact time from the masjid's yearly Jamat
        // calendar if it has uploaded one; falls back to the fixed
        // *_jamat columns (which don't vary by day) otherwise.
        getJamatForDate(params.id, viewDate),
      ]);
      setAdhan((p as PrayerTime) ?? null);
      setDayJamat(jamat);
      setDayLoading(false);
    })();
  }, [params.id, locationId, viewDate]);

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

  const dayLabel =
    dayOffset === 0
      ? "Today"
      : dayOffset === 1
      ? "Tomorrow"
      : dayOffset === -1
      ? "Yesterday"
      : viewDate.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });

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

          <View style={styles.dayNav}>
            <TouchableOpacity onPress={() => setDayOffset((d) => d - 1)} style={styles.dayNavButton}>
              <Ionicons name="chevron-back" size={18} color={theme.colors.accent} />
            </TouchableOpacity>
            <Text style={styles.dayNavLabel}>{dayLabel}</Text>
            <TouchableOpacity onPress={() => setDayOffset((d) => d + 1)} style={styles.dayNavButton}>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.accent} />
            </TouchableOpacity>
            {dayOffset !== 0 && (
              <TouchableOpacity onPress={() => setDayOffset(0)} style={styles.dayNavToday}>
                <Text style={styles.dayNavTodayText}>Today</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>Prayer</Text>
              <Text style={styles.tableHeaderCell}>Azan</Text>
              <Text style={styles.tableHeaderCell}>Iqama</Text>
            </View>
            {dayLoading ? (
              <ActivityIndicator color={theme.colors.accent} style={{ marginVertical: 20 }} />
            ) : (
              <>
                {PRAYER_ROWS.map((row) => (
                  <View key={row.label} style={styles.tableRow}>
                    <Text style={[styles.tableCellLabel, { flex: 1.2 }]}>{row.label}</Text>
                    <Text style={styles.tableCell}>
                      {adhan ? formatTime12h(adhan[row.adhanKey] as string) : "—"}
                    </Text>
                    <Text style={styles.tableCell}>
                      {formatTime12h(dayJamat?.[row.jamatTodayKey] ?? (masjid[row.jamatKey] as string | null)) ?? "—"}
                    </Text>
                  </View>
                ))}
                {(dayJamat?.jumma ?? masjid.jumma_jamat) && (
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCellLabel, { flex: 1.2 }]}>Jumu'ah</Text>
                    <Text style={styles.tableCell}>—</Text>
                    <Text style={styles.tableCell}>{formatTime12h(dayJamat?.jumma ?? masjid.jumma_jamat)}</Text>
                  </View>
                )}
                {dayJamat && (
                  <Text style={styles.calendarNote}>
                    {dayLabel === "Today" ? "Today's" : `${dayLabel}'s`} exact Jamat times from this masjid's yearly
                    calendar.
                  </Text>
                )}
              </>
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
    dayNav: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      marginTop: 20,
    },
    dayNavButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.colors.cardBg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    dayNavLabel: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      minWidth: 100,
      textAlign: "center",
    },
    dayNavToday: {
      marginLeft: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.accent,
    },
    dayNavTodayText: { color: "white", fontSize: 11, fontWeight: "700" },
    table: {
      marginTop: 12,
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
    calendarNote: {
      fontSize: 11,
      color: theme.colors.textMuted,
      fontStyle: "italic",
      padding: 10,
      paddingTop: 0,
    },
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
