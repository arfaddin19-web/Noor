import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { gregorianToHijri, HIJRI_MONTHS } from "../lib/hijri";
import { getIslamicEvents } from "../lib/islamicEvents";
import { useTheme } from "../lib/ThemeContext";
import type { Theme } from "../theme";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function sameDate(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface Cell {
  date: Date | null;
  hijriDay: number | null;
  isToday: boolean;
  hasEvent: boolean;
}

/** A real month-view calendar — Gregorian grid with the Hijri day-of-month
 *  shown under each date, today highlighted, and a dot on any date that has
 *  an Islamic event. Navigate month-to-month with the arrows. */
export default function CalendarGrid() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const currentHijriYear = useMemo(() => gregorianToHijri(today).year, [today]);
  const events = useMemo(
    () => [
      ...getIslamicEvents(currentHijriYear - 1),
      ...getIslamicEvents(currentHijriYear),
      ...getIslamicEvents(currentHijriYear + 1),
    ],
    [currentHijriYear]
  );

  const cells = useMemo<Cell[]>(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const leading = firstOfMonth.getDay();
    const list: Cell[] = [];
    for (let i = 0; i < leading; i++) list.push({ date: null, hijriDay: null, isToday: false, hasEvent: false });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      list.push({
        date,
        hijriDay: gregorianToHijri(date).day,
        isToday: sameDate(date, today),
        hasEvent: events.some((e) => sameDate(e.date, date)),
      });
    }
    while (list.length % 7 !== 0) list.push({ date: null, hijriDay: null, isToday: false, hasEvent: false });
    return list;
  }, [viewYear, viewMonth, events, today]);

  const monthHijri = gregorianToHijri(new Date(viewYear, viewMonth, 15)); // mid-month, avoids month-boundary ambiguity

  function goPrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <View style={[styles.card, theme.cardShadow]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goPrevMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={18} color={theme.colors.accent} />
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <Text style={styles.hijriLabel}>
            {HIJRI_MONTHS[monthHijri.month - 1]} {monthHijri.year} AH
          </Text>
        </View>
        <TouchableOpacity onPress={goNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.accent} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((w, i) => (
          <Text key={i} style={styles.weekdayLabel}>{w}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell, i) => (
          <View key={i} style={styles.cell}>
            {cell.date && (
              <View style={[styles.cellInner, cell.isToday && styles.cellInnerToday]}>
                <Text style={[styles.hijriText, cell.isToday && styles.hijriTextToday]}>
                  {cell.hijriDay}
                </Text>
                <Text style={[styles.dayText, cell.isToday && styles.dayTextToday]}>
                  {cell.date.getDate()}
                </Text>
                {cell.hasEvent && <View style={[styles.eventDot, cell.isToday && styles.eventDotToday]} />}
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.cardBg,
      margin: theme.spacing.md,
      marginBottom: 0,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
    },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    navButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.colors.pageBg,
      alignItems: "center",
      justifyContent: "center",
    },
    monthLabel: { fontSize: 15, fontWeight: "800", color: theme.colors.textPrimary },
    hijriLabel: { fontSize: 11, color: theme.colors.accent, fontWeight: "700", marginTop: 1 },
    weekdayRow: { flexDirection: "row", marginTop: 14 },
    weekdayLabel: {
      flex: 1,
      textAlign: "center",
      fontSize: 10,
      fontWeight: "700",
      color: theme.colors.textMuted,
    },
    grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
    cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: "center", justifyContent: "center" },
    cellInner: { alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 17 },
    cellInnerToday: { backgroundColor: theme.colors.accent },
    // The Hijri day is the primary (bigger, bolder) number — this is an
    // Islamic calendar first — with the Gregorian day shown smaller beneath
    // it, the reverse of a typical Gregorian-first calendar.
    hijriText: { fontSize: 13, fontWeight: "700", color: theme.colors.textPrimary },
    hijriTextToday: { color: "white" },
    dayText: { fontSize: 9, color: theme.colors.textMuted, marginTop: -1 },
    dayTextToday: { color: "rgba(255,255,255,0.85)" },
    eventDot: {
      position: "absolute",
      bottom: 1,
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.gold,
    },
    eventDotToday: { backgroundColor: "white" },
  });
}
