"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useLeads } from "../hooks/useLeads";
import { useLeadsUIStore } from "../store";
import { LeadStatus } from "../types";
import { KpiCards } from "./KpiCards";
import { LeadModal } from "./LeadModal";
import { LeadsList } from "./LeadsList";
import { StatusFilter } from "./StatusFilter";

export function LeadsDashboard() {
  const { allLeads, leads, isPending, isError, error } = useLeads();
  const filter = useLeadsUIStore((state) => state.filter);
  const setFilter = useLeadsUIStore((state) => state.setFilter);
  const openAddModal = useLeadsUIStore((state) => state.openAddModal);
  const openEditModal = useLeadsUIStore((state) => state.openEditModal);
  const isModalOpen = useLeadsUIStore((state) => state.isModalOpen);

  const leadsCounts: Record<LeadStatus, number> = {
    idea: 0,
    contacted: 0,
    proposal_sent: 0,
    negotiating: 0,
    won: 0,
    lost: 0,
  };

  for (const lead of allLeads ?? []) {
    leadsCounts[lead.status] += 1;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
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

      <KpiCards counts={leadsCounts} isPending={isPending} isError={isError} />

      <section className="flex flex-col gap-4" aria-label="Leads">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-xl font-medium sm:text-2xl">
              Leads
            </h2>
            <p className="text-muted-foreground text-base">
              {isPending
                ? "Loading…"
                : isError
                  ? "Couldn't load"
                  : `${leads?.length ?? 0} shown`}
            </p>
          </div>
          <Button
            onClick={openAddModal}
            type="button"
            size="lg"
            className="h-11 text-base"
          >
            <Plus />
            Add lead
          </Button>
        </div>

        <StatusFilter value={filter} onChange={setFilter} />

        <LeadsList
          leads={leads ?? []}
          isPending={isPending}
          isError={isError}
          error={error}
          filter={filter}
          openEditModal={openEditModal}
        />
      </section>

      {isModalOpen && <LeadModal />}
    </div>
  );
}
