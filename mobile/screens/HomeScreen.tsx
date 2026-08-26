import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ComponentProps } from "react";
import type { HomeStackParamList } from "../App";
import MosqueSkyline from "../components/MosqueSkyline";
import { supabase } from "../lib/supabase";
import { PrayerTime, Location, Masjid } from "../lib/types";
import { getCurrentPrayer, getNextPrayer, todayMonthDay } from "../lib/prayerLogic";
import { formatHijri } from "../lib/hijri";
import { getHomeCity, getHomeMasjidId } from "../lib/homeMasjid";
import { getQuranActivityToday } from "../lib/quranProgress";
import { getTodaySalatChecklist, toggleSalat, SALAT_ORDER, SalatChecklist } from "../lib/salatChecklist";
import { getActiveNotices, Notice } from "../lib/notices";
import { useAuth } from "../lib/useAuth";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

type Nav = NativeStackNavigationProp<HomeStackParamList, "HomeMain">;
type IoniconName = ComponentProps<typeof Ionicons>["name"];
type MCIName = ComponentProps<typeof MaterialCommunityIcons>["name"];

// Everything except Ask/Account lives in this same Home stack; those two are
// sibling *tabs*, reached via the parent tab navigator instead.
const HOME_STACK_SCREENS = new Set([
  "Qibla",
  "QuranList",
  "Hadith",
  "Tasbih",
  "Dua",
  "Donate",
  "Settings",
  "Masjids",
  "HalalFood",
]);

type GridItem = {
  key: string;
  label: string;
  set: "ion" | "mci";
  icon: IoniconName | MCIName;
};

const GRID_ITEMS: GridItem[] = [
  { key: "Qibla", label: "Qibla", set: "ion", icon: "compass-outline" },
  { key: "QuranList", label: "Qur'an", set: "ion", icon: "book-outline" },
  { key: "Hadith", label: "Hadith", set: "ion", icon: "document-text-outline" },
  { key: "Tasbih", label: "Tasbih", set: "mci", icon: "counter" },
  { key: "Masjids", label: "Masjids", set: "mci", icon: "mosque" },
  { key: "HalalFood", label: "Halal Food", set: "ion", icon: "restaurant-outline" },
  { key: "Dua", label: "Dua", set: "mci", icon: "hands-pray" },
  { key: "Donate", label: "Donate", set: "ion", icon: "heart-outline" },
  { key: "Settings", label: "Settings", set: "ion", icon: "settings-outline" },
  { key: "Ask", label: "Ask AI", set: "ion", icon: "chatbubble-ellipses-outline" },
  { key: "Account", label: "Account", set: "ion", icon: "person-outline" },
];

const JAMAT_KEY_FOR_LABEL: Record<string, keyof Masjid> = {
  Fajr: "fajr_jamat",
  Dhuhr: "dhuhr_jamat",
  Asr: "asr_jamat",
  Maghrib: "maghrib_jamat",
  Isha: "isha_jamat",
};

export default function HomeScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const tileColors = [
    theme.colors.tile1, theme.colors.tile2, theme.colors.tile3, theme.colors.tile4,
    theme.colors.tile5, theme.colors.tile6, theme.colors.tile7, theme.colors.tile8,
  ];
  const navigation = useNavigation<Nav>();
  const { profile } = useAuth();
  const [location, setLocation] = useState<Location | null>(null);
  const [today, setToday] = useState<PrayerTime | null>(null);
  const [tomorrow, setTomorrow] = useState<PrayerTime | null>(null);
  const [masjids, setMasjids] = useState<Masjid[]>([]);
  const [homeMasjid, setHomeMasjid] = useState<Masjid | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [checklist, setChecklist] = useState<SalatChecklist>({
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  });
  const [quranActivity, setQuranActivity] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: loc }, homeCity, homeMasjidId, todayChecklist, quranCount, activeNotices] =
      await Promise.all([
        supabase.from("locations").select("*").eq("is_default", true).single(),
        getHomeCity(),
        getHomeMasjidId(),
        getTodaySalatChecklist(),
        getQuranActivityToday(),
        getActiveNotices(),
      ]);
    setLocation((loc as Location | null) ?? null);
    setSelectedCity(homeCity);
    setChecklist(todayChecklist);
    setQuranActivity(quranCount);
    setNotices(activeNotices);

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
  const current = today ? getCurrentPrayer(today, now) : null;
  const nextJamat = next && homeMasjid ? (homeMasjid[JAMAT_KEY_FOR_LABEL[next.label]] as string | null) : null;

  const doneCount = SALAT_ORDER.filter((p) => checklist[p.key]).length;

  async function handleToggleSalat(key: (typeof SALAT_ORDER)[number]["key"]) {
    const updated = await toggleSalat(key);
    setChecklist(updated);
  }

  function goTo(key: string) {
    if (HOME_STACK_SCREENS.has(key)) {
      // Every route in HOME_STACK_SCREENS takes no params, but TS can't narrow
      // navigate()'s overload from a plain `string` key — cast is safe here.
      (navigation.navigate as (screen: string) => void)(key);
    } else {
      // "Ask" / "Account" are sibling tabs, not routes in this stack.
      navigation.getParent()?.navigate(key);
    }
  }

  const firstName = profile?.full_name?.trim().split(/\s+/)[0];

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={theme.colors.accent} />}
    >
      <LinearGradient
        colors={[theme.colors.skyTop, theme.colors.skyMid, theme.colors.skyBottom]}
        style={styles.hero}
      >
        <View style={styles.topBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting} numberOfLines={1}>
              Assalamu alaikum{firstName ? `, ${firstName}` : ""}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={theme.colors.textOnDarkMuted} />
              <Text style={styles.locationText} numberOfLines={1}>
                {homeMasjid ? homeMasjid.name : (location?.name ?? "Set your location")}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bellButton} onPress={() => navigation.navigate("Settings")}>
            <Ionicons name="notifications-outline" size={18} color={theme.colors.textOnDark} />
          </TouchableOpacity>
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
            {next && (
              <View style={styles.prayerCols}>
                <View style={styles.prayerCol}>
                  <Text style={styles.glassLabel}>Current</Text>
                  <Text style={styles.currentPrayerLabel}>{current?.label ?? "—"}</Text>
                  <Text style={styles.endsAtText}>until {next.time.toTimeString().slice(0, 5)}</Text>
                </View>
                <View style={styles.colDivider} />
                <View style={styles.prayerCol}>
                  <Text style={styles.glassLabel}>Next prayer</Text>
                  <Text style={styles.nowPrayerLabel}>{next.label}</Text>
                  <Text style={styles.nowPrayerTime}>{next.time.toTimeString().slice(0, 5)}</Text>
                </View>
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

        <MosqueSkyline color={theme.colors.gold} style={styles.skyline} />
      </LinearGradient>

      {notices.length > 0 && (
        <View style={[styles.noticeCard, theme.cardShadow]}>
          <View style={styles.noticeIconWrap}>
            <Ionicons name="megaphone-outline" size={16} color={theme.colors.accentDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.noticeTitle}>{notices[0].title}</Text>
            <Text style={styles.noticeBody}>{notices[0].body}</Text>
          </View>
        </View>
      )}

      <View style={[styles.progressCard, theme.cardShadow]}>
        <Text style={styles.progressTitle}>Today's Progress</Text>

        <View style={styles.salatRow}>
          {SALAT_ORDER.map((p) => {
            const done = checklist[p.key];
            return (
              <TouchableOpacity
                key={p.key}
                style={styles.salatItem}
                onPress={() => handleToggleSalat(p.key)}
              >
                <View style={[styles.salatDot, done && styles.salatDotDone]}>
                  {done && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <Text style={styles.salatLabel}>{p.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${(doneCount / 5) * 100}%` }]} />
        </View>
        <Text style={styles.progressSubtitle}>
          {doneCount} of 5 prayers logged today
          {quranActivity > 0 ? `  •  Qur'an opened ${quranActivity}× today` : ""}
        </Text>
      </View>

      <View style={styles.grid}>
        {GRID_ITEMS.map((item, i) => (
          <TouchableOpacity key={item.key} style={styles.gridTile} onPress={() => goTo(item.key)}>
            <View style={[styles.gridIconWrap, { backgroundColor: tileColors[i % tileColors.length] }]}>
              {item.set === "ion" ? (
                <Ionicons name={item.icon as IoniconName} size={24} color="white" />
              ) : (
                <MaterialCommunityIcons name={item.icon as MCIName} size={24} color="white" />
              )}
            </View>
            <Text style={styles.gridLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeader}>
          {selectedCity ? `Mosques in ${selectedCity}` : "Mosques"}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Masjids")}>
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
              <MaterialCommunityIcons name="mosque" size={30} color={theme.colors.accent} />
            </View>
            <Text style={styles.mosqueName} numberOfLines={1}>{m.name}</Text>
            {m.address && (
              <Text style={styles.mosqueAddress} numberOfLines={1}>{m.address}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.colors.pageBg },
    hero: {
      paddingTop: 56,
      paddingHorizontal: 20,
      paddingBottom: 56,
      borderBottomLeftRadius: theme.radius.xl,
      borderBottomRightRadius: theme.radius.xl,
      overflow: "hidden",
    },
    topBar: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 14 },
    greeting: { color: theme.colors.textOnDark, fontSize: 18, fontWeight: "700", marginBottom: 6 },
    locationRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    locationText: { color: theme.colors.textOnDarkMuted, fontSize: 13, fontWeight: "600", flexShrink: 1 },
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
    prayerCols: { flexDirection: "row", alignItems: "center" },
    prayerCol: { flex: 1 },
    colDivider: { width: 1, height: 52, backgroundColor: theme.colors.glassBorder, marginHorizontal: 16 },
    currentPrayerLabel: { color: theme.colors.textOnDark, fontSize: 22, fontWeight: "800", marginTop: 4 },
    endsAtText: { color: theme.colors.textOnDarkMuted, fontSize: 11, marginTop: 3, fontWeight: "600" },
    emptyText: { color: theme.colors.textOnDarkMuted, textAlign: "center" },
    emptyTextDark: { color: theme.colors.textMuted, paddingHorizontal: 20 },
    nowPrayerLabel: { color: theme.colors.gold, fontSize: 18, fontWeight: "700", marginTop: 4 },
    nowPrayerTime: { color: theme.colors.textOnDark, fontSize: 26, fontWeight: "800", marginTop: 2 },
    jamatBanner: {
      marginTop: 14,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: theme.colors.glassBorder,
    },
    jamatBannerText: { color: theme.colors.textOnDark, fontSize: 13, fontWeight: "600" },
    skyline: {
      position: "absolute",
      bottom: -6,
      left: 0,
      right: 0,
      paddingHorizontal: 16,
      opacity: 0.5,
    },
    noticeCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      marginHorizontal: 20,
      marginTop: -28,
    },
    noticeIconWrap: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.colors.gold,
      alignItems: "center",
      justifyContent: "center",
    },
    noticeTitle: { fontSize: 13, fontWeight: "700", color: theme.colors.textPrimary },
    noticeBody: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2, lineHeight: 17 },
    progressCard: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      marginHorizontal: 20,
      marginTop: 16,
    },
    progressTitle: { fontSize: 15, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: 14 },
    salatRow: { flexDirection: "row", justifyContent: "space-between" },
    salatItem: { alignItems: "center", gap: 6 },
    salatDot: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    salatDotDone: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
    salatLabel: { fontSize: 11, color: theme.colors.textMuted, fontWeight: "600" },
    progressBarTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.border,
      marginTop: 16,
      overflow: "hidden",
    },
    progressBarFill: { height: "100%", backgroundColor: theme.colors.accent, borderRadius: 3 },
    progressSubtitle: { fontSize: 12, color: theme.colors.textMuted, marginTop: 10, fontWeight: "600" },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 20,
      marginTop: 26,
      rowGap: 20,
      columnGap: 0,
      justifyContent: "space-between",
    },
    gridTile: { width: "31%", alignItems: "center", gap: 8 },
    gridIconWrap: {
      ...theme.cardShadow,
      width: 64,
      height: 64,
      borderRadius: theme.radius.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    gridLabel: { fontSize: 12, color: theme.colors.textPrimary, textAlign: "center", fontWeight: "600" },
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
      ...theme.cardShadow,
      width: 150,
      height: 100,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.pageBg,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    mosqueName: { fontSize: 13, fontWeight: "700", color: theme.colors.textPrimary },
    mosqueAddress: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },
  });
}
