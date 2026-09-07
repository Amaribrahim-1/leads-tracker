# Freelance Leads & Follow-up Tracker — Project Spec

**Owner:** Amar — solo developer, single-user tool.
**Purpose:** A personal, hand-written practice project to build real muscle
memory across the full stack (Next.js, TypeScript, Supabase, Zod, React
Hook Form, Zustand, TanStack Query) after realizing most of the Areej
project ended up AI-generated rather than self-written. This is not a
throwaway exercise — Amar will actually use it to track his own freelance
leads.

**Time budget:** One week as a soft target. If time runs short, cut
optional scope (see below) — never outsource writing to close the gap.

**Workflow — read this before anything else:**
This project follows a strict "developer writes everything" rule — the
opposite split from Areej, where AI owned the backend. Full rules live in
`.cursor/rules/mentor-behavior.mdc`, `.cursor/rules/review-checklist.mdc`,
and `.cursor/rules/stack-conventions.mdc`. Read all three, in full, before
generating `tasks.md`.

**Content language:** No Arabic/RTL requirement for the UI itself — this is
a personal tool, English copy is fine. Conversation with Amar stays
Egyptian Arabic (see `mentor-behavior.mdc`).

---

## Tech stack & versions

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Supabase (Postgres + Auth)
- Zod
- React Hook Form
- Zustand
- TanStack Query
- shadcn/ui (styling only — see `stack-conventions.mdc`)

---

## What this app is

A single-user dashboard to track freelance leads (clients, platforms, job
opportunities) from first contact through to closing (won or lost).

## Core user flow

1. Amar logs in (single user — no public/guest access, no admin role).
2. Main page shows: KPI-style stat cards (count per status), a status
   filter, and the leads list.
3. "Add New Lead" opens a modal with the lead form.
4. Saving a lead updates the list immediately (no full page reload).
5. Each row allows: changing status inline via a dropdown (optimistic
   update), opening the row to edit, and deleting with a confirmation step.
6. Empty state when there are no leads yet.

---

## Data model (description only — this is NOT the migration)

**This section describes the required shape only. Writing the actual
Supabase migration and RLS policy is a real task in `tasks.md`, written by
Amar by hand — see the code-writing rule in `mentor-behavior.mdc`. Cursor's
role during that task is to think it through with him, not to write it.**

One table: `leads`, scoped to its owner via `user_id` + RLS
(`auth.uid() = user_id`, no other role — no admin, no public read).

| Field             | Type              | Notes                                             |
|--------------------|-------------------|-----------------------------------------------------|
| `id`               | uuid              | primary key                                          |
| `user_id`          | uuid              | references `auth.users`, owner of the row            |
| `name`             | text              | required — client/platform name                      |
| `source`           | text, nullable    | link, phone number, or note on where this lead came from |
| `status`           | text              | check constraint against the fixed list below         |
| `notes`            | text, nullable    | free text                                             |
| `next_follow_up`   | date, nullable    |                                                        |
| `created_at`       | timestamptz       |                                                        |
| `updated_at`       | timestamptz       |                                                        |

### Status values (fixed, English keys — no admin-managed categories)

`idea` → `contacted` → `proposal_sent` → `negotiating` → `won` / `lost`

The business meaning of each status is already documented in Amar's own
glossary file — refer there, do not redefine it here.

---

## Scope

**Core (must ship):**
- `leads` table + RLS
- Add/edit form (RHF + Zod)
- List + status filter
- Delete with confirmation
- Inline status change with optimistic update — the main new concept this
  project is meant to teach

**Optional (cut first if time runs short):**
- KPI cards
- Sort by `next_follow_up`

**Out of scope entirely:**
- Multiple users / sharing leads
- Notifications or reminders
- Kanban / drag-and-drop board view

---

## Brand color

The full color block (already wired for `globals.css`), contrast tables,
and reuse rules live in `stack-conventions.mdc` and Amar's reference file
`my-color-system.md`. Do not introduce a new hue or bring back the retired
mint accent.

---

## First action in a new Cursor session

Read this file plus all three `.cursor/rules/*.mdc` files in full, then
generate `tasks.md` yourself: an ordered, plain-English task breakdown
covering schema → types → query hooks → UI → mutations → optimistic
update, in that order. Write each task the way a human teammate would
explain it out loud — clear and concrete, in plain English — and only
define a term inline the first time it appears if it isn't already
covered in Amar's glossary files.
