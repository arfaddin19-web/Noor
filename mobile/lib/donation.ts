import { supabase } from "./supabase";

export interface DonationInfo {
  message: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  esewa_id: string;
  khalti_id: string;
}

const EMPTY: DonationInfo = {
  message: "",
  bank_name: "",
  account_name: "",
  account_number: "",
  esewa_id: "",
  khalti_id: "",
};

export async function getDonationInfo(): Promise<DonationInfo> {
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "donation_info")
    .maybeSingle();
  return { ...EMPTY, ...(data?.value as Partial<DonationInfo> | undefined) };
}
