"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { toast } from "sonner";

import { LEAD_STATUSES, STATUS_LABELS } from "../statusLabels";
import { STATUS_BADGE_CLASS } from "../statusStyles";
import { LeadStatus } from "../types";
import { useUpdateLeadStatus } from "../hooks/useUpdateLeadStatus";
import { blockIfOffline } from "@/lib/isBrowserOffline";

type StatusSelectProps = {
  value: LeadStatus;
  leadName: string;
  id: string;
};

export function StatusSelect({ value, leadName, id }: StatusSelectProps) {
  const { mutate, isPending } = useUpdateLeadStatus();

  function handleStatusChange(next: LeadStatus | null) {
    if (!next || next === value || isPending) return;
    if (blockIfOffline()) return;

    mutate(
      { id, status: next },
      {
        onSuccess: () => {
          toast.success(`${leadName} → ${STATUS_LABELS[next]}`);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <Select value={value} onValueChange={handleStatusChange}>
      <SelectTrigger
        size="sm"
        aria-label={`Change status for ${leadName}`}
        className={cn(
          "h-7 min-w-36 border text-sm font-medium",
          STATUS_BADGE_CLASS[value],
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start" alignItemWithTrigger={false}>
        {LEAD_STATUSES.map((status) => (
          <SelectItem key={status} value={status} className="text-sm">
            {STATUS_LABELS[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
