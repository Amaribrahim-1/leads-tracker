"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLead } from "../api/createLead";
import { LeadFormType } from "../schema";

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lead: LeadFormType) => createLead(lead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
