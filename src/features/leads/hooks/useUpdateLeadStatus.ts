"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLeadStatus } from "../api/updateLeadStatus";
import { Lead, LeadStatus } from "../types";

type UpdateLeadStatusInput = {
  id: string;
  status: LeadStatus;
};

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["leads"] });

      const previousLeads = queryClient.getQueryData<Lead[]>(["leads"]);

      queryClient.setQueryData<Lead[]>(["leads"], (prev) => {
        if (!prev) return prev;
        return prev.map((lead) =>
          lead.id === id ? { ...lead, status } : lead,
        );
      });

      return { previousLeads };
    },

    mutationFn: ({ id, status }: UpdateLeadStatusInput) =>
      updateLeadStatus(id, status),

    onError: (_error, _variables, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(["leads"], context.previousLeads);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
