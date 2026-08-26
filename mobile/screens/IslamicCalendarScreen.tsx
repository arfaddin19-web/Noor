import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenBackground from "../components/ScreenBackground";
import { supabase } from "../lib/supabase";
import { PrayerTime, Location } from "../lib/types";
import { todayMonthDay } from "../lib/prayerLogic";
import { gregorianToHijri, HIJRI_MONTHS } from "../lib/hijri";
import { getIslamicEvents, getRamadanRange, getRelevantRamadanYear, IslamicEvent } from "../lib/islamicEvents";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

type Tab = "events" | "ramadan";

interface RamadanDay {
  index: number;
  date: Date;
  sehriEnds: string | null;
  iftar: string | null;
}

function daysUntil(date: Date, now: Date): number {
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const b = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return Math.round((b - a) / 86_400_000);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export default function IslamicCalendarScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [tab, setTab] = useState<Tab>("events");
  const now = useMemo(() => new Date(), []);
  const currentHijri = useMemo(() => gregorianToHijri(now), [now]);

  const events = useMemo(() => getIslamicEvents(currentHijri.year), [currentHijri.year]);

  const [ramadanDays, setRamadanDays] = useState<RamadanDay[]>([]);
  const [ramadanYear, setRamadanYear] = useState<number | null>(null);
  const [loadingRamadan, setLoadingRamadan] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tab !== "ramadan" || ramadanDays.length > 0) return;
    (async () => {
      setLoadingRamadan(true);
      setError(null);
      const hy = getRelevantRamadanYear(now);
      setRamadanYear(hy);
      const { start, end } = getRamadanRange(hy);

      const { data: loc } = await supabase
        .from("locations")
        .select("*")
        .eq("is_default", true)
        .single<Location>();
      if (!loc) {
        setError("No prayer time location set up yet.");
        setLoadingRamadan(false);
        return;
      }

      const dates: Date[] = [];
      for (let d = new Date(start); d.getTime() <= end.getTime(); d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
      const monthDayPairs = dates.map((d) => ({ date: d, ...todayMonthDay(d) }));
      const months = [...new Set(monthDayPairs.map((p) => p.month))];

      const { data: rows } = await supabase
        .from("prayer_times")
        .select("*")
        .eq("location_id", loc.id)
        .in("month", months);
      const byKey = new Map<string, PrayerTime>();
      (rows as PrayerTime[] | null)?.forEach((r) => byKey.set(`${r.month}-${r.day}`, r));

      const result: RamadanDay[] = monthDayPairs.map((p, i) => {
        const row = byKey.get(`${p.month}-${p.day}`);
        return {
          index: i + 1,
          date: p.date,
          sehriEnds: row?.fajr ?? null,
          iftar: row?.maghrib ?? null,
        };
      });
      setRamadanDays(result);
      setLoadingRamadan(false);
    })();
  }, [tab]);

  return (
    <ScreenBackground>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>
          {HIJRI_MONTHS[currentHijri.month - 1]} {currentHijri.year} AH
        </Text>
        <Text style={styles.headerCaveat}>
          Dates use a standard tabular calendar and are estimates — your local masjid's
          moon-sighting announcement may shift Ramadan, Eid, or other dates by a day.
        </Text>
      </View>

      <View style={styles.tabRow}>
        {(["events", "ramadan"] as Tab[]).map((t) => (
          <TouchableOpacity key={t} style={styles.tab} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "events" ? "Events" : "Ramadan"}
            </Text>
            {tab === t && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {tab === "events" && (
        <ScrollView contentContainerStyle={styles.listContent}>
          {events.map((e) => (
            <EventRow key={e.title} event={e} now={now} theme={theme} styles={styles} />
          ))}
        </ScrollView>
      )}

      {tab === "ramadan" && (
        <ScrollView contentContainerStyle={styles.listContent}>
          {loadingRamadan ? (
            <ActivityIndicator color={theme.colors.accent} style={{ marginTop: 40 }} />
          ) : error ? (
            <Text style={styles.muted}>{error}</Text>
          ) : (
            <>
              <Text style={styles.ramadanSubtitle}>
                Ramadan {ramadanYear} AH{ramadanDays.length > 0 ? ` — ${formatDate(ramadanDays[0].date)} to ${formatDate(ramadanDays[ramadanDays.length - 1].date)}` : ""}
              </Text>
              {ramadanDays.map((d) => (
                <View key={d.index} style={[styles.ramadanRow, theme.cardShadow]}>
                  <View style={styles.ramadanDayBadge}>
                    <Text style={styles.ramadanDayText}>{d.index}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ramadanDate}>{formatDate(d.date)}</Text>
                  </View>
                  <View style={styles.ramadanTimeCol}>
                    <Text style={styles.ramadanTimeLabel}>Sehri ends</Text>
                    <Text style={styles.ramadanTimeValue}>{d.sehriEnds ?? "—"}</Text>
                  </View>
                  <View style={styles.ramadanTimeCol}>
                    <Text style={styles.ramadanTimeLabel}>Iftar</Text>
                    <Text style={styles.ramadanTimeValue}>{d.iftar ?? "—"}</Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </ScreenBackground>
  );
}

function EventRow({
  event,
  now,
  theme,
  styles,
}: {
  event: IslamicEvent;
  now: Date;
  theme: Theme;
  styles: ReturnType<typeof makeStyles>;
}) {
  const diff = daysUntil(event.date, now);
  const passed = diff < 0;
  let badge: string;
  if (diff === 0) badge = "Today";
  else if (diff === 1) badge = "Tomorrow";
  else if (passed) badge = formatDate(event.date);
  else badge = `in ${diff} days`;

  return (
    <View style={[styles.eventRow, theme.cardShadow, passed && styles.eventRowPassed]}>
      <View style={styles.eventIconWrap}>
        <Ionicons name="moon-outline" size={16} color={passed ? theme.colors.textMuted : theme.colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.eventTitle, passed && styles.eventTitlePassed]}>{event.title}</Text>
        <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
        {event.note && <Text style={styles.eventNote}>{event.note}</Text>}
      </View>
      {!passed && (
        <View style={styles.eventBadge}>
          <Text style={styles.eventBadgeText}>{badge}</Text>
        </View>
      )}
    </View>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    headerCard: {
      backgroundColor: theme.colors.cardBg,
      margin: theme.spacing.md,
      marginBottom: 0,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
    },
    headerTitle: { fontSize: 18, fontWeight: "800", color: theme.colors.textPrimary },
    headerCaveat: { fontSize: 11, color: theme.colors.textMuted, marginTop: 6, lineHeight: 16 },
    tabRow: {
      flexDirection: "row",
      paddingHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tab: { paddingVertical: 12, marginRight: 28, alignItems: "center" },
    tabText: { fontSize: 14, fontWeight: "700", color: theme.colors.textMuted },
    tabTextActive: { color: theme.colors.accent },
    tabUnderline: { marginTop: 8, height: 3, width: 28, borderRadius: 2, backgroundColor: theme.colors.accent },
    listContent: { padding: theme.spacing.md },
    muted: { color: theme.colors.textMuted, textAlign: "center", marginTop: 40 },
    eventRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    eventRowPassed: { opacity: 0.55 },
    eventIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: theme.colors.pageBg,
      alignItems: "center",
      justifyContent: "center",
    },
    eventTitle: { fontSize: 15, fontWeight: "700", color: theme.colors.textPrimary },
    eventTitlePassed: { color: theme.colors.textMuted },
    eventDate: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
    eventNote: { fontSize: 11, color: theme.colors.textMuted, marginTop: 4, lineHeight: 15 },
    eventBadge: {
      backgroundColor: theme.colors.accent,
      borderRadius: theme.radius.pill,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    eventBadgeText: { color: "white", fontSize: 11, fontWeight: "700" },
    ramadanSubtitle: { fontSize: 13, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: 12 },
    ramadanRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.radius.md,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    ramadanDayBadge: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    ramadanDayText: { color: "white", fontWeight: "800", fontSize: 12 },
    ramadanDate: { fontSize: 12, fontWeight: "600", color: theme.colors.textPrimary },
    ramadanTimeCol: { alignItems: "center", minWidth: 64 },
    ramadanTimeLabel: { fontSize: 9, color: theme.colors.textMuted, fontWeight: "700" },
    ramadanTimeValue: { fontSize: 13, color: theme.colors.accent, fontWeight: "800", marginTop: 2 },
  });
}
