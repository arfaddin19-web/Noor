import { supabase } from "./supabase";

export interface Notice {
  id: string;
  title: string;
  body: string;
  is_active: boolean;
  created_at: string;
}

export async function getActiveNotices(): Promise<Notice[]> {
  const { data } = await supabase
    .from("notices")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(5);
  return (data as Notice[]) ?? [];
}
