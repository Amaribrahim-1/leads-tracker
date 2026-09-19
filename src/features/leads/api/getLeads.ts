import { createClient } from "@/lib/supabase/client";
import { Lead } from "../types";

export async function getLeads(): Promise<Lead[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
