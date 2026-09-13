import { Inbox } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type LeadsEmptyStateProps = {
  filtered?: boolean;
};

export function LeadsEmptyState({ filtered = false }: LeadsEmptyStateProps) {
  return (
    <Empty className="border border-dashed border-border bg-card/40 py-14">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Inbox />
        </EmptyMedia>
        <EmptyTitle className="text-lg">
          {filtered ? "No leads with this status" : "No leads yet"}
        </EmptyTitle>
        <EmptyDescription className="text-base">
          {filtered
            ? "Try another status, or switch back to All."
            : "There are no leads to show yet."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
