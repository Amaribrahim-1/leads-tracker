import { createClient } from "@/lib/supabase/client";
import { LeadFormType } from "../schema";
import { Lead } from "../types";

export async function updateLead(
  id: string,
  values: LeadFormType,
): Promise<Lead> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("leads")
    .update({
      name: values.name,
      source: values.source || null,
      status: values.status,
      notes: values.notes || null,
      next_follow_up: values.next_follow_up || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
