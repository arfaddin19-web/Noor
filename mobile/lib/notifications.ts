import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase } from "./supabase";
import { Location, PrayerTime, PRAYER_LABELS } from "./types";
import { getHadithForDate } from "./hadithOfDay";

const STORAGE_KEY = "noor.notificationsEnabled";
const SOUND_KEY = "noor.adhanSoundEnabled";
const HADITH_STORAGE_KEY = "noor.hadithNotificationsEnabled";
const DAYS_AHEAD = 7;
const HADITH_DAYS_AHEAD = 14;
const HADITH_NOTIFICATION_HOUR = 8; // 8:00am local time

Notifications.setNotificationHandler({
  handleNotification: async () => {
    const soundEnabled = (await AsyncStorage.getItem(SOUND_KEY)) !== "false";
    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: soundEnabled,
      shouldSetBadge: false,
    };
  },
});

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

async function getAdhanSoundEnabled(): Promise<boolean> {
  const v = await AsyncStorage.getItem(SOUND_KEY);
  return v !== "false"; // default on
}

/** Prayer and Hadith-of-the-Day notifications are scheduled independently, so
 *  cancelling/rescheduling one type must never wipe out the other — every
 *  notification this module schedules is tagged with `data.noorType`, and
 *  this only cancels the ones matching `type`. */
async function cancelNotificationsOfType(type: "prayer" | "hadith"): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = scheduled.filter((n) => n.content.data?.noorType === type);
  await Promise.all(toCancel.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

/** Schedules a local notification for each remaining Fajr/Dhuhr/Asr/Maghrib/Isha
 *  Adhan over the next `DAYS_AHEAD` days at the default location. Cancels any
 *  previously scheduled prayer notifications first, so this is safe to call
 *  repeatedly (e.g. once per app open, or when the sound preference changes)
 *  without piling up duplicates. */
export async function scheduleUpcomingPrayerNotifications(): Promise<void> {
  await cancelNotificationsOfType("prayer");
  const soundEnabled = await getAdhanSoundEnabled();

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
          sound: soundEnabled,
          data: { noorType: "prayer" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fireDate,
        },
      });
    }
  }
}

/** Schedules one "Hadith of the Day" notification per day for the next
 *  `HADITH_DAYS_AHEAD` days, with that day's hadith text embedded directly in
 *  the notification — readable straight from the lock screen/notification
 *  shade, no need to open the app. Since local notifications can't fetch
 *  anything at delivery time, the text has to be baked in when scheduling. */
export async function scheduleUpcomingHadithNotifications(): Promise<void> {
  await cancelNotificationsOfType("hadith");

  const now = new Date();
  for (let i = 0; i < HADITH_DAYS_AHEAD; i++) {
    const day = new Date(now);
    day.setDate(day.getDate() + i);
    const fireDate = new Date(day);
    fireDate.setHours(HADITH_NOTIFICATION_HOUR, 0, 0, 0);
    if (fireDate.getTime() <= now.getTime()) continue;

    const hadith = getHadithForDate(day);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Hadith of the Day",
        body: `${hadith.text} — ${hadith.reference}`,
        data: { noorType: "hadith" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireDate,
      },
    });
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
      await cancelNotificationsOfType("prayer");
    }
    setEnabled(next);
    await AsyncStorage.setItem(STORAGE_KEY, String(next));
  }, []);

  return { enabled, loading, toggle };
}

/** Whether the Adhan notification should play a sound (vs. a silent banner).
 *  Only matters while prayer notifications themselves are enabled. */
export function useAdhanSoundSetting() {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SOUND_KEY).then((v) => {
      setEnabled(v !== "false");
      setLoading(false);
    });
  }, []);

  const toggle = useCallback(async (next: boolean) => {
    setEnabled(next);
    await AsyncStorage.setItem(SOUND_KEY, String(next));
    // Re-schedule so any already-queued notifications pick up the new sound
    // preference; a no-op (harmless) if notifications are currently disabled,
    // since it just re-cancels+re-adds nothing meaningful shows up.
    const notifsOn = (await AsyncStorage.getItem(STORAGE_KEY)) === "true";
    if (notifsOn) await scheduleUpcomingPrayerNotifications();
  }, []);

  return { enabled, loading, toggle };
}

/** Whether the daily "Hadith of the Day" notification is on. Independent of
 *  the prayer-time notification toggle. */
export function useHadithNotificationSetting() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(HADITH_STORAGE_KEY).then((v) => {
      const isEnabled = v === "true";
      setEnabled(isEnabled);
      setLoading(false);
      if (isEnabled) scheduleUpcomingHadithNotifications();
    });
  }, []);

  const toggle = useCallback(async (next: boolean) => {
    if (next) {
      const granted = await ensurePermission();
      if (!granted) return;
      await scheduleUpcomingHadithNotifications();
    } else {
      await cancelNotificationsOfType("hadith");
    }
    setEnabled(next);
    await AsyncStorage.setItem(HADITH_STORAGE_KEY, String(next));
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
