import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import { LeadStatus } from "../types";
import { KpiCards } from "./KpiCards";

const pendingCounts: Record<LeadStatus, number> = {
  idea: 0,
  contacted: 0,
  proposal_sent: 0,
  negotiating: 0,
  won: 0,
  lost: 0,
};

export function LeadsDashboardFallback() {
  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8"
      role="status"
      aria-live="polite"
    >
      <header className="flex flex-col gap-2">
        <p className="text-sage text-base font-medium tracking-wide uppercase">
          Pipeline
        </p>
        <h1 className="font-heading text-4xl font-medium tracking-tight sm:text-5xl">
          Leads
        </h1>
        <p className="text-muted-foreground max-w-xl text-base sm:text-lg">
          Track freelance leads from first contact to close.
        </p>
      </header>

      <Separator />

      <KpiCards counts={pendingCounts} isPending />

      <section className="flex flex-col gap-4" aria-label="Leads">
        <p className="text-muted-foreground text-base">Loading leads…</p>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </section>
    </div>
  );
}
