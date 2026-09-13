import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().min(1),
  source: z.string().optional(),
  notes: z.string().optional(),
  next_follow_up: z.string().optional(),
  status: z.enum([
    "idea",
    "contacted",
    "proposal_sent",
    "negotiating",
    "won",
    "lost",
  ]),
});

export type LeadFormType = z.infer<typeof leadSchema>;
