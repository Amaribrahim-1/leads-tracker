"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { getLeads } from "../api/getLeads";
import { parseStatusFilter } from "../statusLabels";

export function useLeads() {
  const searchParams = useSearchParams();
  const filter = parseStatusFilter(searchParams.get("status"));

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["leads"],
    queryFn: () => getLeads(createClient()),
  });

  const leads =
    filter === "all" ? data : data?.filter((lead) => lead.status === filter);

  return { allLeads: data, leads, filter, isPending, isError, error };
}
