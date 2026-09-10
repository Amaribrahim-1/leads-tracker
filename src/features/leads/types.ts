export type LeadStatus =
  | "idea"
  | "contacted"
  | "proposal_sent"
  | "negotiating"
  | "won"
  | "lost";

export type Lead = {
  id: string;
  user_id: string;
  name: string;
  source: string | null;
  status: LeadStatus;
  notes: string | null;
  next_follow_up: string | null;
  created_at: string;
  updated_at: string;
};
