import { getLeads } from "@/features/leads/api/getLeads";
import { LeadsDashboard } from "@/features/leads/components/LeadsDashboard";
import { LeadsDashboardFallback } from "@/features/leads/components/LeadsDashboardFallback";
import { getClaims } from "@/lib/supabase/getClaims";
import { createClient } from "@/lib/supabase/server";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Home() {
  // claims = facts in the login cookie (who you are), not the full user profile.
  // null means nobody is signed in.
  const claims = await getClaims();

  if (!claims) {
    redirect("/login");
  }

  return (
    <Suspense fallback={<LeadsDashboardFallback />}>
      <LeadsPage />
    </Suspense>
  );
}

async function LeadsPage() {
  const queryClient = new QueryClient();

  await queryClient.query({
    queryKey: ["leads"],
    queryFn: async () => getLeads(await createClient()),
  });

  /*
   prefetchQuery: same cache fill.
   but deprecated (gone in v6). 
   Does not throw on error.
  */
  // await queryClient.prefetchQuery({
  //   queryKey: ["leads"],
  //   queryFn: getLeadsForServer,
  // });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LeadsDashboard />
    </HydrationBoundary>
  );
}
