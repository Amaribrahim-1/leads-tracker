import type { SupabaseClient } from "@supabase/supabase-js";
import { Lead } from "../types";

export async function getLeads(supabase: SupabaseClient): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("next_follow_up");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
