import { createClient } from "@/lib/supabase/client";
import { LeadFormType } from "../schema";
import { Lead } from "../types";

export async function createLead(values: LeadFormType): Promise<Lead> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(userError?.message ?? "Not signed in");
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      user_id: user.id,
      name: values.name,
      source: values.source || null,
      status: values.status,
      notes: values.notes || null,
      next_follow_up: values.next_follow_up || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
