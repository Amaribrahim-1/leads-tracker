import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { STATUS_LABELS } from "../statusLabels";
import { STATUS_BADGE_CLASS } from "../statusStyles";
import { LeadStatus } from "../types";

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("h-6 px-2.5 text-sm font-medium", STATUS_BADGE_CLASS[status])}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
