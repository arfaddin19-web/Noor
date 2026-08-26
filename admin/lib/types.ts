export type UserRole = "user" | "admin";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  gender: "male" | "female" | null;
  role: UserRole;
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  source: string | null;
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

export type FoodCategory =
  | "restaurant"
  | "cafe"
  | "bakery"
  | "grocery"
  | "butcher"
  | "other";

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
  /** Jamat (congregation) times set by/for this masjid — distinct from the
   *  location-wide Adhan times in `prayer_times`. */
  fajr_jamat: string | null;
  dhuhr_jamat: string | null;
  asr_jamat: string | null;
  maghrib_jamat: string | null;
  isha_jamat: string | null;
  jumma_jamat: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface HalalFoodPlace {
  id: string;
  name: string;
  category: FoodCategory;
  address: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  halal_certified: boolean;
  description: string | null;
  photo_url: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface AiQaHistory {
  id: string;
  user_id: string | null;
  question: string;
  answer: string;
  flagged: boolean;
  created_at: string;
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  is_active: boolean;
  created_at: string;
}

export interface DonationInfo {
  message: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  esewa_id: string;
  khalti_id: string;
}

export interface CommunityOrg {
  id: string;
  name: string;
  city: string | null;
  contact_person: string | null;
  designation: string | null;
  phone: string | null;
  description: string | null;
  is_approved: boolean;
  created_at: string;
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
