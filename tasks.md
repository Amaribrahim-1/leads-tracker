# Leads Tracker — Task Breakdown

Generated from `project-spec.md` + `.cursor/rules/*.mdc`, per the "First
action in a new Cursor session" instructions.

## How this file works

Two kinds of tasks in here, and they work differently:

- **Setup tasks (0.1, 0.2)** — pure configuration with no learning value.
  Per `mentor-behavior.mdc`'s code-writing exceptions, Cursor does these
  directly when you say go. They're listed explicitly here so you can see
  them happen, not so they happen silently before Task 1.
- **Everything from Task 1 onward** — real project code. You write all of
  it by hand. Cursor's role per task is a "talk it through" partner
  (design tradeoffs, syntax, patterns) — never the author. Each task says
  explicitly what Cursor's role is, so there's no ambiguity mid-task.

Order follows project-spec.md's required sequence: schema → types → query
hooks → UI → mutations → optimistic update. A couple of things not named
in that list (auth, UI-only state) are slotted in where they're actually
needed as prerequisites, with the reasoning stated in each task.

After each task is marked done, you'll get the exact git commit
command(s) + message per the workflow in `mentor-behavior.mdc` — not
included pre-emptively here since that's a per-completion step, not a
planning one.

---

## Setup (config-only — Cursor does these directly)

- [x] Task 0.1 — Set up the feature-based folder structure

**What:** create `src/features/leads/` with the subfolders
`components/`, `hooks/`, `api/`, plus starter files `schema.ts` and
`store.ts` — per the structure in `stack-conventions.mdc`. Also create
`src/lib/supabase/` as the home for the Supabase client instances (shared
infra, not leads-specific, so it lives outside `features/leads/`).

**Why:** gives every task after this one a fixed, agreed-on home for its
code, so nothing gets built in a random spot and moved later.

**Cursor's role:** creates the empty folders/files directly — no code
logic in them yet, just scaffolding.

- [x] Task 0.2 — Wire brand colors into Tailwind v4 / shadcn

**What:** replace the default shadcn neutral palette in
`src/app/globals.css` with the brand color block from
`stack-conventions.mdc` (`--forest`, `--cream`, `--mustard`, `--sage`,
mapped to `--background` / `--foreground` / `--primary` /
`--primary-foreground` / `--ring`), keeping the existing `@theme inline`
variable _names_ as-is (shadcn/Nova components reference those names) and
only changing the underlying values.

**Why:** one-time visual foundation — every component built afterward
(buttons, modal, cards) should already look like the real app instead of
default shadcn gray.

**Cursor's role:** makes the edit directly; will flag anything that looks
like it'd break the existing `@theme` wiring instead of silently
guessing.

---

- [x] Task 1 — Design the `leads` table + RLS policy (schema)

**Term — RLS (Row-Level Security):** a Postgres feature that filters which
rows a query is even allowed to touch, enforced by the database itself,
not by app code. Even if the frontend forgets a filter somewhere, the DB
won't leak or allow edits to a row that isn't yours.

**What:** write the SQL migration for one table, `leads`, with the columns
described in `project-spec.md` (`id`, `user_id`, `name`, `source`,
`status`, `notes`, `next_follow_up`, `created_at`, `updated_at`), a check
constraint restricting `status` to the fixed list (`idea` →
`contacted` → `proposal_sent` → `negotiating` → `won` / `lost`), and an RLS policy so a
row is only readable/writable when `auth.uid() = user_id`.

**Why first:** every later task (types, hooks, UI) is either describing or
consuming this shape — nothing else can meaningfully start before this
exists.

**Cursor's role:** talk through table design, what the check constraint
buys you versus validating `status` in Zod alone, and how RLS policies
are structured (`USING` vs `WITH CHECK`) — you write and run the actual
migration.

---

- [x] Task 2 — Supabase client setup + login (auth)

**What:** create the Supabase client instances the App Router needs (a
browser client and a server client — same pattern as Areej), a single
login page/form (email + password is enough — no signup UI needed since
you're the only user; the account itself can just be created once from
the Supabase dashboard), and a way to keep the main page protected
(redirect to login when there's no session).

**Why here:** every query hook from Task 5 onward needs an actual logged-in
session to test against — RLS will reject everything otherwise.

**Cursor's role:** talk through where the two clients should live (likely
`src/lib/supabase/client.ts` + `server.ts`) and how the protected-route
redirect should work — you write the code.

---

- [x] Task 3 — TypeScript types for a Lead (types)

**What:** hand-write a `Lead` type and a `LeadStatus` union of the six
fixed status values, matching the table shape from Task 1. Decide where
it lives (e.g. `src/features/leads/types.ts`, or inferred later from the
Zod schema in Task 7 — worth a quick discussion on the tradeoff before you
commit to one).

**Why here:** every hook and component from here on references "a lead" —
better to fix that shape once, deliberately, than let it drift implicitly
across files.

**Cursor's role:** talk through the options (hand-written interface vs.
Supabase-generated types vs. `z.infer` from Zod) — you decide and write
it.

---

- [x] Task 4 — Zustand UI store (`useLeadsUIStore`)

**What:** the one UI-state store for this feature, holding exactly what
`stack-conventions.mdc` specifies: the active status filter, whether the
add/edit modal is open, its mode (`add` or `edit`), and which lead is
currently being edited. No server data lives in here — that's TanStack
Query's job starting next task.

**Why here:** the filter value this store holds is what the next task's
fetch hook will read to decide which leads to request — so the store
needs to exist first.

**Cursor's role:** a sounding board if you want to talk through
shape/naming — otherwise nothing; this is core learning stack, you write
it solo.

---

- [ ] Checkpoint — Refresh the auth session in `proxy.ts` (before Task 5)

**What:** add `src/proxy.ts` so `@supabase/ssr` can refresh the auth token
on each request. Server Components cannot write cookies; without this,
a session that expires (~1 hour) fails closed (`getClaims` empty, RLS
rejects) with no obvious login-form error.

**Why here, not in Task 2:** email/password login and the home-page
redirect work without it. The first place a stale cookie actually hurts
is Task 5, when `useLeads` hits the `leads` table.

**Cursor's role:** talk through `getAll` / `setAll` on the request and
response — you write the file. Same official Next.js SSR pattern as
Task 2's server client.

---

- [ ] Task 5 — Query hook: fetch leads (`useLeads`)

**Term — TanStack Query:** a library that manages "server state" — data
that actually lives in your database, not just in the browser — handling
caching, loading/error states, and refetching, so you're not hand-rolling
`useEffect` + `useState` for every fetch.

**What:** a pure `getLeads` helper in `features/leads/api/` that calls
`supabase.from('leads').select(...)`, and a `useLeads` hook in
`features/leads/hooks/` wrapping it in TanStack Query's `useQuery`,
reading the active filter from `useLeadsUIStore` (Task 4) to decide what
to fetch.

**Why here:** this is the first thing that actually proves Tasks 1–4 fit
together — schema, auth, types, and store all feed into this one hook.

**Cursor's role:** talk through query keys (how TanStack Query caches by
key) and whether filtering happens server-side or client-side at this
data size — you write the hook and helper.

---

- [ ] Task 6 — Main page UI: stat cards + filter + list (read-only)

**What:** the main page, read-only first — no add/edit/delete yet, just
proving data flows end-to-end onto the screen. Covers: the leads list
(shadcn/ui primitives for structure), the status filter control wired to
`useLeadsUIStore`, the empty state for zero leads, and — optional, first
thing to cut if time is short per the scope section — the KPI-style stat
cards showing a count per status (`idea` gets its own KPI card like
the other five).

**Why split from the form:** keeps this task's surface small — you're
only proving "data in Supabase shows up on screen," not building forms.

**Cursor's role:** a UI/UX sounding board if wanted — components, layout,
and JSX are yours.

---

- [ ] Task 7 — Zod schema for the lead form (`leadSchema`)

**What:** the one Zod schema per `stack-conventions.mdc`, covering every
form field (`name` required, `source` / `notes` / `next_follow_up`
optional, `status` restricted to the six-value fixed list). Worth deciding here
whether the form's input type comes from `z.infer<typeof leadSchema>` or
stays fully separate from Task 3's `Lead` type — a real simplicity
tradeoff, not a formality.

**Why here, not earlier:** it's used by exactly one thing — the form in
Task 8 — no reason to define it before that's imminent.

**Cursor's role:** talk through Zod syntax/patterns if any of it is new,
and the schema-vs-type tradeoff above — you write the schema.

---

- [ ] Task 8 — Add/Edit lead modal + form + create/update mutations (UI + mutations)

**Term — React Hook Form (RHF):** a library that manages form state
(values, validation errors, submit handling) without hand-writing an
`onChange` handler per field. `zodResolver` is the small adapter that
plugs your Task 7 Zod schema in as RHF's validation logic.

**What:** the modal (open/closed + mode driven by `useLeadsUIStore`), the
form inside it wired with `useForm` + `zodResolver(leadSchema)`, and two
mutation hooks — `useCreateLead` and `useUpdateLead` — built on TanStack
Query's `useMutation`, each calling a pure `createLead` / `updateLead`
helper in `features/leads/api/`. On success, invalidate the Task 5 query
so the list updates without a full page reload.

**Why grouped together:** the form is pointless without something to
submit to, and the mutations are pointless without a form to trigger
them.

**Cursor's role:** talk through RHF + Zod wiring and TanStack Query's
mutate-then-invalidate pattern if new to you — you write the component,
hooks, and helpers. Feel free to split this into two commits (form, then
mutations) if it starts feeling big.

---

- [ ] Task 9 — Delete with confirmation (mutation)

**What:** a delete action per row that requires a confirmation step before
doing anything destructive — a shadcn/ui `AlertDialog` fits this exactly,
no need to hand-build a confirm dialog. Wired to a `useDeleteLead`
mutation + `deleteLead` helper, same invalidate-on-success pattern as
Task 8.

**Why last among the mutations:** it's the simplest of the three
(create/update/delete) and has no dependency on anything not already
built.

**Cursor's role:** flag the relevant shadcn/ui component if you're unsure
it's already available — you wire the mutation and UI.

---

- [ ] Task 10 — Inline status change with optimistic update

**Term — optimistic update:** updating what's on screen immediately when
the user acts (e.g. picks a new status from a dropdown), _before_ the
server has confirmed anything — then rolling back only if the request
actually fails. The payoff: the UI feels instant instead of waiting on a
network round-trip for something this small. **This is the main new
concept this whole project is meant to teach** — take your time here.

**What:** a status dropdown per row (a shadcn/ui `Select` is enough), wired
to a `useUpdateLeadStatus` mutation using TanStack Query's
`onMutate` / `onError` / `onSettled` lifecycle: `onMutate` writes the new
status straight into the cached list before the server responds,
`onError` rolls it back to the previous cached value if the request
fails, `onSettled` refetches so the cache ends up matching whatever the
server actually has.

**Why last:** it's the one genuinely new pattern in the project, and it
leans on everything before it (the query cache from Task 5, the mutation
pattern from Tasks 8–9) — better to have that muscle memory in place
first.

**Cursor's role:** this is the one task worth a real conceptual walkthrough
before you write a line — ask to be taught the
`onMutate` / `onError` / `onSettled` lifecycle if it's not click yet. The
actual hook and dropdown are still yours to write.

---

- [ ] Task 11 — Sort by `next_follow_up` (optional, first to cut)

**What:** a sort control (or just a fixed default sort) on the leads list
by `next_follow_up`, soonest first. Use `date-fns` for any date
comparison — don't hand-roll date math, per `stack-conventions.mdc`.

**Why optional:** the scope section in `project-spec.md` lists this as the
first thing to drop if the one-week budget runs short — the app is fully
usable without it.

**Cursor's role:** none — small enough to just write directly once you get
here.

---

## Explicitly out of scope (not tasks)

Per `project-spec.md`: multiple users/sharing, notifications/reminders,
Kanban/drag-and-drop board view. Don't build toward these "just in case."
