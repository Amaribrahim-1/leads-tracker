import { Button } from "@/components/ui/button";

import { LEAD_STATUSES, STATUS_LABELS } from "../statusLabels";
import { LeadStatus } from "../types";

type StatusFilterValue = LeadStatus | "all";

type StatusFilterProps = {
  value: StatusFilterValue;
  onChange?: (value: StatusFilterValue) => void;
};

const FILTER_OPTIONS: StatusFilterValue[] = ["all", ...LEAD_STATUSES];

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filter leads by status"
      className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
    >
      {FILTER_OPTIONS.map((option) => {
        const isActive = value === option;

        return (
          <Button
            key={option}
            type="button"
            size="lg"
            variant={isActive ? "default" : "outline"}
            aria-pressed={isActive}
            className="h-11 w-full px-3.5 text-base sm:w-auto"
            onClick={() => onChange?.(option)}
          >
            {STATUS_LABELS[option]}
          </Button>
        );
      })}
    </div>
  );
}
