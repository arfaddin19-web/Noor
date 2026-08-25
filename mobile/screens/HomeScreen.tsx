import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../App";
import { supabase } from "../lib/supabase";
import { PrayerTime, Location, Masjid } from "../lib/types";
import { getNextPrayer, todayMonthDay } from "../lib/prayerLogic";
import { formatHijri } from "../lib/hijri";
import { getHomeCity, getHomeMasjidId } from "../lib/homeMasjid";
import { theme } from "../theme";

type Nav = NativeStackNavigationProp<HomeStackParamList, "HomeMain">;

// Qibla/QuranList/Hadith/Nearby live in this same Home stack; Ask/Account are
// sibling *tabs*, reached via the parent tab navigator instead.
const HOME_STACK_SCREENS = new Set(["Qibla", "QuranList", "Hadith", "Nearby"]);

const GRID_ITEMS = [
  { key: "Qibla", label: "Qibla Direction", emoji: "🧭", color: theme.colors.tile1 },
  { key: "QuranList", label: "Qur'an", emoji: "📖", color: theme.colors.tile2 },
  { key: "Hadith", label: "Hadith", emoji: "📜", color: theme.colors.tile3 },
  { key: "Nearby", label: "Halal Food", emoji: "🍽️", color: theme.colors.tile4 },
  { key: "Ask", label: "Ask AI", emoji: "💬", color: theme.colors.tile5 },
  { key: "Account", label: "Account", emoji: "👤", color: theme.colors.tile6 },
] as const;

const JAMAT_KEY_FOR_LABEL: Record<string, keyof Masjid> = {
  Fajr: "fajr_jamat",
  Dhuhr: "dhuhr_jamat",
  Asr: "asr_jamat",
  Maghrib: "maghrib_jamat",
  Isha: "isha_jamat",
};

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [location, setLocation] = useState<Location | null>(null);
  const [today, setToday] = useState<PrayerTime | null>(null);
  const [tomorrow, setTomorrow] = useState<PrayerTime | null>(null);
  const [masjids, setMasjids] = useState<Masjid[]>([]);
  const [homeMasjid, setHomeMasjid] = useState<Masjid | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: loc }, homeCity, homeMasjidId] = await Promise.all([
      supabase.from("locations").select("*").eq("is_default", true).single(),
      getHomeCity(),
      getHomeMasjidId(),
    ]);
    setLocation((loc as Location | null) ?? null);
    setSelectedCity(homeCity);

    if (loc) {
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
    }

    if (homeMasjidId) {
      const { data } = await supabase
        .from("masjids")
        .select("*")
        .eq("id", homeMasjidId)
        .maybeSingle();
      setHomeMasjid((data as Masjid) ?? null);
    } else {
      setHomeMasjid(null);
    }

    const masjidQuery = supabase.from("masjids").select("*").eq("is_approved", true).limit(6);
    const { data: nearbyMasjids } = homeCity
      ? await masjidQuery.eq("city", homeCity)
      : await masjidQuery.order("created_at", { ascending: false });
    setMasjids((nearbyMasjids as Masjid[]) ?? []);

    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(tick);
  }, []);

  const next = today ? getNextPrayer(today, tomorrow, now) : null;
  const nextJamat = next && homeMasjid ? (homeMasjid[JAMAT_KEY_FOR_LABEL[next.label]] as string | null) : null;

  function goTo(key: (typeof GRID_ITEMS)[number]["key"]) {
    if (HOME_STACK_SCREENS.has(key)) {
      navigation.navigate(key as "Qibla" | "QuranList" | "Hadith" | "Nearby");
    } else {
      // "Ask" / "Account" are sibling tabs, not routes in this stack.
      navigation.getParent()?.navigate(key);
    }
  }

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
    >
      <LinearGradient
        colors={[theme.colors.skyTop, theme.colors.skyMid, theme.colors.skyBottom]}
        style={styles.hero}
      >
        <View style={styles.topBar}>
          <View style={styles.locationPill}>
            <Text style={styles.pinIcon}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {homeMasjid ? homeMasjid.name : (location?.name ?? "Set your location")}
            </Text>
          </View>
          <View style={styles.bellButton}>
            <Text style={{ fontSize: 16 }}>🔔</Text>
          </View>
        </View>

        <Text style={styles.dateText}>
          {now.toLocaleDateString(undefined, {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
          {"  •  "}
          {formatHijri(now)} AH
        </Text>

        {loading ? (
          <ActivityIndicator color="white" style={{ marginVertical: 40 }} />
        ) : !today ? (
          <View style={styles.glassCard}>
            <Text style={styles.emptyText}>
              No prayer time data yet. Add it from the admin dashboard.
            </Text>
          </View>
        ) : (
          <View style={styles.glassCard}>
            <Text style={styles.glassLabel}>
              {homeMasjid ? "Adhan (national) time" : "Prayer time in"}
            </Text>
            <Text style={styles.glassLocation}>{location?.name}</Text>
            {next && (
              <View style={styles.nowRow}>
                <View>
                  <Text style={styles.glassLabel}>Next up</Text>
                  <Text style={styles.nowPrayerLabel}>{next.label}</Text>
                </View>
                <Text style={styles.nowPrayerTime}>{next.time.toTimeString().slice(0, 5)}</Text>
              </View>
            )}
            {homeMasjid && (
              <View style={styles.jamatBanner}>
                <Text style={styles.jamatBannerText}>
                  {nextJamat
                    ? `Jamat at ${homeMasjid.name}: ${nextJamat}`
                    : `${homeMasjid.name} hasn't set a Jamat time for ${next?.label ?? "this prayer"} yet`}
                </Text>
              </View>
            )}
          </View>
        )}
      </LinearGradient>

      <View style={styles.grid}>
        {GRID_ITEMS.map((item) => (
          <TouchableOpacity key={item.key} style={styles.gridTile} onPress={() => goTo(item.key)}>
            <View style={[styles.gridIconWrap, { backgroundColor: item.color }]}>
              <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
            </View>
            <Text style={styles.gridLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeader}>
          {selectedCity ? `Mosques in ${selectedCity}` : "Mosques"}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Nearby")}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mosqueRow}>
        {masjids.length === 0 && !loading && (
          <Text style={styles.emptyTextDark}>No masjids added yet.</Text>
        )}
        {masjids.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={styles.mosqueCard}
            onPress={() => navigation.navigate("MasjidDetail", { id: m.id })}
          >
            <View style={styles.mosquePhoto}>
              <Text style={{ fontSize: 30 }}>🕌</Text>
            </View>
            <Text style={styles.mosqueName} numberOfLines={1}>{m.name}</Text>
            {m.address && (
              <Text style={styles.mosqueAddress} numberOfLines={1}>📍 {m.address}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.pageBg },
  hero: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
    overflow: "hidden",
  },
  topBar: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  locationPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  pinIcon: { fontSize: 13 },
  locationText: { color: theme.colors.textOnDark, fontSize: 13, fontWeight: "600", flexShrink: 1 },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: { color: theme.colors.textOnDarkMuted, fontSize: 13, marginBottom: 16 },
  glassCard: {
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    borderRadius: theme.radius.lg,
    padding: 18,
  },
  glassLabel: { color: theme.colors.textOnDarkMuted, fontSize: 12 },
  glassLocation: { color: theme.colors.textOnDark, fontSize: 16, fontWeight: "700", marginTop: 2 },
  nowRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 14,
  },
  nowPrayerLabel: { color: theme.colors.gold, fontSize: 18, fontWeight: "700" },
  nowPrayerTime: { color: theme.colors.textOnDark, fontSize: 34, fontWeight: "800" },
  emptyText: { color: theme.colors.textOnDarkMuted, textAlign: "center" },
  emptyTextDark: { color: theme.colors.textMuted, paddingHorizontal: 20 },
  jamatBanner: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.glassBorder,
  },
  jamatBannerText: { color: theme.colors.textOnDark, fontSize: 13, fontWeight: "600" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    marginTop: 22,
    gap: 14,
  },
  gridTile: { width: "29%", alignItems: "center", gap: 8 },
  gridIconWrap: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  gridLabel: { fontSize: 11, color: theme.colors.textPrimary, textAlign: "center", fontWeight: "600" },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 12,
  },
  sectionHeader: { fontSize: 17, fontWeight: "700", color: theme.colors.textPrimary },
  seeAll: { fontSize: 13, color: theme.colors.accent, fontWeight: "600" },
  mosqueRow: { paddingHorizontal: 20, gap: 14 },
  mosqueCard: { width: 150 },
  mosquePhoto: {
    width: 150,
    height: 100,
    borderRadius: theme.radius.md,
    backgroundColor: "#dcebe7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  mosqueName: { fontSize: 13, fontWeight: "700", color: theme.colors.textPrimary },
  mosqueAddress: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },
});
