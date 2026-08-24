import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { PrayerTime, PRAYER_LABELS, Location } from "../lib/types";
import { getNextPrayer, todayMonthDay, formatCountdown } from "../lib/prayerLogic";

export default function HomeScreen() {
  const [location, setLocation] = useState<Location | null>(null);
  const [today, setToday] = useState<PrayerTime | null>(null);
  const [tomorrow, setTomorrow] = useState<PrayerTime | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  async function load() {
    setLoading(true);
    const { data: loc } = await supabase
      .from("locations")
      .select("*")
      .eq("is_default", true)
      .single();
    setLocation(loc as Location | null);
    if (!loc) {
      setLoading(false);
      return;
    }

    const { month, day } = todayMonthDay();
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    const tmrw = todayMonthDay(nextDate);

    const [todayRes, tomorrowRes] = await Promise.all([
      supabase
        .from("prayer_times")
        .select("*")
        .eq("location_id", loc.id)
        .eq("month", month)
        .eq("day", day)
        .maybeSingle(),
      supabase
        .from("prayer_times")
        .select("*")
        .eq("location_id", loc.id)
        .eq("month", tmrw.month)
        .eq("day", tmrw.day)
        .maybeSingle(),
    ]);

    setToday((todayRes.data as PrayerTime) ?? null);
    setTomorrow((tomorrowRes.data as PrayerTime) ?? null);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const tick = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(tick);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!today) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>
          No prayer time data yet for this location. Add it from the admin dashboard.
        </Text>
      </View>
    );
  }

  const next = getNextPrayer(today, tomorrow, now);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
    >
      <View style={styles.headerCard}>
        <Text style={styles.locationText}>{location?.name}</Text>
        <Text style={styles.dateText}>
          {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </Text>
        {next && (
          <>
            <Text style={styles.nextLabel}>Next: {next.label}</Text>
            <Text style={styles.countdown}>{formatCountdown(next.msRemaining)}</Text>
          </>
        )}
      </View>

      <View style={styles.list}>
        {PRAYER_LABELS.map(({ key, label }) => {
          const isNext = next?.label === label;
          return (
            <View key={key} style={[styles.row, isNext && styles.rowActive]}>
              <Text style={[styles.rowLabel, isNext && styles.rowLabelActive]}>{label}</Text>
              <Text style={[styles.rowTime, isNext && styles.rowLabelActive]}>
                {today[key] as string}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7faf9" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  muted: { color: "#6b7280", textAlign: "center" },
  headerCard: {
    backgroundColor: "#0e8a72",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  locationText: { color: "#d6f0ea", fontSize: 14, marginBottom: 2 },
  dateText: { color: "white", fontSize: 16, fontWeight: "600", marginBottom: 12 },
  nextLabel: { color: "#d6f0ea", fontSize: 13 },
  countdown: { color: "white", fontSize: 32, fontWeight: "700" },
  list: { marginHorizontal: 16, borderRadius: 16, backgroundColor: "white", overflow: "hidden" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  rowActive: { backgroundColor: "#f2faf8" },
  rowLabel: { fontSize: 16, color: "#111827" },
  rowLabelActive: { color: "#0e8a72", fontWeight: "700" },
  rowTime: { fontSize: 16, color: "#374151" },
});
