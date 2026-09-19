import { createClient } from "@/lib/supabase/client";

export async function deleteLead(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
