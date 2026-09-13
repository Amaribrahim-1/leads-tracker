import { LeadStatus } from "./types";

export const STATUS_TONE_CLASS: Record<LeadStatus, string> = {
  idea: "text-status-idea",
  contacted: "text-status-contacted",
  proposal_sent: "text-status-proposal",
  negotiating: "text-status-negotiating",
  won: "text-status-won",
  lost: "text-status-lost",
};

export const STATUS_BADGE_CLASS: Record<LeadStatus, string> = {
  idea: "border-status-idea/60 bg-status-idea/25 text-status-idea",
  contacted:
    "border-status-contacted/60 bg-status-contacted/25 text-status-contacted",
  proposal_sent:
    "border-status-proposal/60 bg-status-proposal/25 text-status-proposal",
  negotiating:
    "border-status-negotiating/60 bg-status-negotiating/25 text-status-negotiating",
  won: "border-status-won/60 bg-status-won/25 text-status-won",
  lost: "border-status-lost/60 bg-status-lost/25 text-status-lost",
};
