import { LeadStatus } from "./types";

export const LEAD_STATUSES: LeadStatus[] = [
  "idea",
  "contacted",
  "proposal_sent",
  "negotiating",
  "won",
  "lost",
];

export const STATUS_LABELS: Record<LeadStatus | "all", string> = {
  all: "All",
  idea: "Idea",
  contacted: "Contacted",
  proposal_sent: "Proposal sent",
  negotiating: "Negotiating",
  won: "Won",
  lost: "Lost",
};
