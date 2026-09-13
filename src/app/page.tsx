import { LeadsDashboard } from "@/features/leads/components/LeadsDashboard";
import { getClaims } from "@/lib/supabase/getClaims";
import { redirect } from "next/navigation";

export default async function Home() {
  // claims = facts in the login cookie (who you are), not the full user profile.
  // null means nobody is signed in.
  const claims = await getClaims();

  if (!claims) {
    redirect("/login");
  }

  return <LeadsDashboard />;
}
