import { createClient } from "@/lib/supabase/client";
import { LeadStatus } from "../types";

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const supabase = createClient();
  const { error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
