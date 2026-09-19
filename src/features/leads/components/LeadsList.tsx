import { format, parseISO } from "date-fns";
import { Pencil } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Lead, LeadStatus } from "../types";
import { LeadsEmptyState } from "./LeadsEmptyState";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { DeleteLeadButton } from "./DeleteLeadButton";

type LeadsListProps = {
  leads: Lead[];
  isPending?: boolean;
  isError?: boolean;
  error?: Error | null;
  filter?: LeadStatus | "all";
  openEditModal: (lead: Lead) => void;
};

function formatFollowUp(value: string | null) {
  if (!value) return "—";

  const date = parseISO(value);
  if (Number.isNaN(date.getTime())) return "—";

  return format(date, "MMM d, yyyy");
}

export function LeadsList({
  leads,
  isPending = false,
  isError = false,
  error = null,
  filter = "all",
  openEditModal,
}: LeadsListProps) {
  if (isPending) {
    return <LeadsListSkeleton />;
  }

  if (isError) {
    return (
      <p role="alert" className="text-destructive text-base">
        {error?.message ?? "Could not load leads."}
      </p>
    );
  }

  if (leads.length === 0) {
    return <LeadsEmptyState filtered={filter !== "all"} />;
  }

  return (
    <>
      <ul className="flex flex-col gap-3 md:hidden">
        {leads.map((lead) => (
          <li key={lead.id}>
            <LeadCard
              lead={lead}
              onEdit={() => openEditModal(lead)}
            />
          </li>
        ))}
      </ul>

      <Card className="hidden py-0 md:block">
        <Table className="text-base" aria-label="Leads">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-12 px-4 text-base">Name</TableHead>
              <TableHead className="text-base">Source</TableHead>
              <TableHead className="text-base">Status</TableHead>
              <TableHead className="text-base">Next follow-up</TableHead>
              <TableHead className="px-4 text-base">Notes</TableHead>
              <TableHead className="px-4 text-base">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="px-4 font-medium">{lead.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {lead.source ?? "—"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={lead.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatFollowUp(lead.next_follow_up)}
                </TableCell>
                <TableCell className="max-w-56 truncate px-4 text-muted-foreground">
                  {lead.notes ?? "—"}
                </TableCell>
                <TableCell className="px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <EditLeadButton onClick={() => openEditModal(lead)} />
                    <DeleteLeadButton
                      leadId={lead.id}
                      leadName={lead.name}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}

function EditLeadButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-9 text-base"
      aria-label="Edit lead"
      onClick={onClick}
    >
      <Pencil />
    </Button>
  );
}

function LeadCard({
  lead,
  onEdit,
}: {
  lead: Lead;
  onEdit: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="truncate pr-2 text-lg">{lead.name}</CardTitle>
        <CardDescription className="truncate text-base">
          {lead.source ?? "No source"}
        </CardDescription>
        <CardAction className="flex items-center gap-1">
          <StatusBadge status={lead.status} />
          <EditLeadButton onClick={onEdit} />
          <DeleteLeadButton leadId={lead.id} leadName={lead.name} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 text-base">
        <p>
          <span className="text-muted-foreground">Follow-up </span>
          {formatFollowUp(lead.next_follow_up)}
        </p>
        {lead.notes ? (
          <p className="text-muted-foreground line-clamp-2">{lead.notes}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function LeadsListSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {Array.from({ length: 3 }, (_, index) => (
          <Card key={index} size="sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="hidden space-y-3 p-4 md:block">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </Card>
    </>
  );
}
