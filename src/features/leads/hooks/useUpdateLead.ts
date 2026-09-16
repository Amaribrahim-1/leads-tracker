"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLead } from "../api/updateLead";
import { LeadFormType } from "../schema";

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: LeadFormType }) =>
      updateLead(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
