import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase } from "./supabase";
import { Location, PrayerTime, PRAYER_LABELS } from "./types";

const STORAGE_KEY = "noor.notificationsEnabled";
const DAYS_AHEAD = 7;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Schedules a local notification for each remaining Fajr/Dhuhr/Asr/Maghrib/Isha
 *  Adhan over the next `DAYS_AHEAD` days at the default location. Cancels any
 *  previously scheduled prayer notifications first, so this is safe to call
 *  repeatedly (e.g. once per app open) without piling up duplicates. */
export async function scheduleUpcomingPrayerNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const { data: location } = await supabase
    .from("locations")
    .select("*")
    .eq("is_default", true)
    .single<Location>();
  if (!location) return;

  const now = new Date();
  const dates: Date[] = Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    return d;
  });

  const monthDayPairs = dates.map((d) => {
    const month = d.getMonth() + 1;
    let day = d.getDate();
    const maxDay = daysInMonth(d.getFullYear(), month);
    if (day > maxDay) day = maxDay;
    return { date: d, month, day };
  });

  const months = [...new Set(monthDayPairs.map((p) => p.month))];
  const { data: rows } = await supabase
    .from("prayer_times")
    .select("*")
    .eq("location_id", location.id)
    .in("month", months);

  const rowsByKey = new Map<string, PrayerTime>();
  (rows as PrayerTime[] | null)?.forEach((r) => rowsByKey.set(`${r.month}-${r.day}`, r));

  const salahKeys = PRAYER_LABELS.filter((p) => p.key !== "sunrise");

  for (const { date, month, day } of monthDayPairs) {
    const row = rowsByKey.get(`${month}-${day}`);
    if (!row) continue;

    for (const { key, label } of salahKeys) {
      const [h, m] = (row[key] as string).split(":").map(Number);
      const fireDate = new Date(date);
      fireDate.setHours(h, m, 0, 0);
      if (fireDate.getTime() <= now.getTime()) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${label} time`,
          body: `It's time for ${label} prayer.`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fireDate,
        },
      });
    }
  }
}

async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export function useNotificationSettings() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      const isEnabled = v === "true";
      setEnabled(isEnabled);
      setLoading(false);
      if (isEnabled) scheduleUpcomingPrayerNotifications();
    });
  }, []);

  const toggle = useCallback(async (next: boolean) => {
    if (next) {
      const granted = await ensurePermission();
      if (!granted) return; // user declined — leave the switch off
      await scheduleUpcomingPrayerNotifications();
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
    setEnabled(next);
    await AsyncStorage.setItem(STORAGE_KEY, String(next));
  }, []);

  return { enabled, loading, toggle };
}

/** Android requires a notification channel to be set up once at app start. */
export async function setupAndroidNotificationChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("prayer-times", {
      name: "Prayer time reminders",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}
