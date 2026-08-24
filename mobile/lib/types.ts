export interface Location {
  id: string;
  name: string;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  is_default: boolean;
}

export interface PrayerTime {
  id: string;
  location_id: string;
  month: number;
  day: number;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  jumma: string | null;
}

export interface Masjid {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  description: string | null;
  jumma_time: string | null;
}

export interface HalalFoodPlace {
  id: string;
  name: string;
  category: string;
  address: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  halal_certified: boolean;
  description: string | null;
}

export const PRAYER_LABELS: { key: keyof PrayerTime; label: string }[] = [
  { key: "fajr", label: "Fajr" },
  { key: "sunrise", label: "Sunrise" },
  { key: "dhuhr", label: "Dhuhr" },
  { key: "asr", label: "Asr" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isha", label: "Isha" },
];
