import {
  CircleOff,
  FileText,
  Handshake,
  Lightbulb,
  Phone,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { LEAD_STATUSES, STATUS_LABELS } from "../statusLabels";
import { STATUS_TONE_CLASS } from "../statusStyles";
import { LeadStatus } from "../types";

const STATUS_ICONS: Record<LeadStatus, LucideIcon> = {
  idea: Lightbulb,
  contacted: Phone,
  proposal_sent: FileText,
  negotiating: Handshake,
  won: Trophy,
  lost: CircleOff,
};

type KpiCardsProps = {
  counts: Record<LeadStatus, number>;
  isPending?: boolean;
  isError?: boolean;
};

export function KpiCards({
  counts,
  isPending = false,
  isError = false,
}: KpiCardsProps) {
  return (
    <section aria-label="Lead counts by status">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {LEAD_STATUSES.map((status) => {
          const Icon = STATUS_ICONS[status];
          const count = counts[status];

          return (
            <li key={status}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                    {STATUS_LABELS[status]}
                  </CardTitle>
                  <CardAction>
                    <Icon
                      className={cn("size-5", STATUS_TONE_CLASS[status])}
                      aria-hidden="true"
                    />
                  </CardAction>
                </CardHeader>
                <CardContent>
                  {isPending ? (
                    <Skeleton className="h-10 w-14" />
                  ) : (
                    <p
                      className={cn(
                        "font-heading text-4xl font-medium tabular-nums tracking-tight",
                        STATUS_TONE_CLASS[status],
                      )}
                    >
                      {isError ? "—" : count}
                    </p>
                  )}
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
