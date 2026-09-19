"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteLead } from "../api/deleteLead";

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
