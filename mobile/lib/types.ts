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
  city: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  description: string | null;
  photo_url: string | null;
  /** Jamat (congregation) times set by this masjid — may differ from the
   *  location-wide Adhan times shown on the Prayer Times tab. */
  fajr_jamat: string | null;
  dhuhr_jamat: string | null;
  asr_jamat: string | null;
  maghrib_jamat: string | null;
  isha_jamat: string | null;
  jumma_jamat: string | null;
}

export const JAMAT_LABELS: { key: keyof Masjid; label: string }[] = [
  { key: "fajr_jamat", label: "Fajr" },
  { key: "dhuhr_jamat", label: "Dhuhr" },
  { key: "asr_jamat", label: "Asr" },
  { key: "maghrib_jamat", label: "Maghrib" },
  { key: "isha_jamat", label: "Isha" },
  { key: "jumma_jamat", label: "Jumu'ah" },
];

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
  photo_url: string | null;
}

export const PRAYER_LABELS: { key: keyof PrayerTime; label: string }[] = [
  { key: "fajr", label: "Fajr" },
  { key: "sunrise", label: "Sunrise" },
  { key: "dhuhr", label: "Dhuhr" },
  { key: "asr", label: "Asr" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isha", label: "Isha" },
];
