import { useQuery } from "@tanstack/react-query";
import { getLeads } from "../api/getLeads";
import { useLeadsUIStore } from "../store";

export function useLeads() {
  const filter = useLeadsUIStore((state) => state.filter);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["leads"],
    queryFn: getLeads,
  });

  const leads =
    filter === "all" ? data : data?.filter((lead) => lead.status === filter);

  return { allLeads: data, leads, isPending, isError, error };
}
