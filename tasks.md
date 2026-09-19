# Leads Tracker — Task Breakdown

Generated from `project-spec.md` + `.cursor/rules/*.mdc`, per the "First
action in a new Cursor session" instructions.

## How this file works

Two kinds of tasks in here, and they work differently:

- **Setup tasks (0.1, 0.2)** — pure configuration with no learning value.
  Per `mentor-behavior.mdc`'s code-writing exceptions, Cursor does these
  directly when you say go. They're listed explicitly here so you can see
  them happen, not so they happen silently before Task 1.
- **Everything from Task 1 onward** — learning-stack code (types, Zod,
  Zustand store logic, TanStack Query, RHF, API helpers, Supabase/SQL).
  You write that by hand. Cursor's role per task is a "talk it through"
  partner for that work — never the author of it. Presentational UI
  (modal, inputs, styling) is Cursor's when you ask; it is not the
  practice surface. Each task still says explicitly what Cursor's role
  is, so there's no ambiguity mid-task.

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

- [x] Checkpoint — Refresh the auth session in `proxy.ts` (before Task 5)

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

- [x] Task 5 — Query hook: fetch leads (`useLeads`)

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

**After it works — optional proof (do not skip writing** `proxy.ts`**):**
Temporarily rename `src/proxy.ts` (e.g. `src/proxy.ts.off`) and reload.
The list may still load if `getLeads` uses the browser client —
`client.ts` can write cookies, so "page didn't break" is not the proof.
Check these instead:

1. DevTools → Application → Cookies. The `Expires` column (~2027) is
   how long the browser keeps the cookie box, not how long the
   `access token` inside is valid.
2. Open a `sb-...-auth-token` value. It starts with `base64-`. Strip
   that prefix, decode, and look at `expires_at` (or the JWT `exp`
   inside `access_token`). That timestamp is ~1 hour from the last
   _saved_ refresh. If home/`useLeads` still work while `expires_at`
   is already in the past, the server refreshed in memory and never
   wrote the cookie — the bug the proxy exists to fix.
3. Network → the document request for `/`. With the proxy, a stale
   token produces `Set-Cookie` on that response. Without it, the
   Server Component render does not.

Put `src/proxy.ts` back when you're done looking.

---

- [x] Task 6 — Main page UI: stat cards + filter + list (read-only)

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

- [x] Task 7 — Zod schema for the lead form (`leadSchema`)

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

- [x] Task 8 — Add/Edit lead modal + form + create/update mutations (UI + mutations)

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

**Cursor's role:** write the presentational modal (Dialog, inputs,
styling, loading/error placeholders) when asked. Talk through RHF + Zod
wiring and TanStack Query's mutate-then-invalidate pattern if new to
you — you write the form wiring, hooks, and helpers, including opening
the modal and add vs edit submit. Feel free to split this into two
commits (form, then mutations) if it starts feeling big.

---

- [x] Task 9 — Delete with confirmation (mutation)

**What:** a delete action per row that requires a confirmation step before
doing anything destructive — a shadcn/ui `AlertDialog` fits this exactly,
no need to hand-build a confirm dialog. Wired to a `useDeleteLead`
mutation + `deleteLead` helper, same invalidate-on-success pattern as
Task 8.

**Why last among the mutations:** it's the simplest of the three
(create/update/delete) and has no dependency on anything not already
built.

**Cursor's role:** write the confirmation dialog chrome (shadcn
`AlertDialog`) if you want the UI done for you — you wire
`useDeleteLead` / `deleteLead` and the per-row trigger.

---

- [x] Task 10 — Inline status change with optimistic update

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

- [x] Task 11 — Sort by `next_follow_up` (optional, first to cut)

**What:** a sort control (or just a fixed default sort) on the leads list
by `next_follow_up`, soonest first. Use `date-fns` for any date
comparison — don't hand-roll date math, per `stack-conventions.mdc`.

**Why optional:** the scope section in `project-spec.md` lists this as the
first thing to drop if the one-week budget runs short — the app is fully
usable without it.

**Cursor's role:** none — small enough to just write directly once you get
here.

---

- [x] Task 12 — Prefetch leads on the server (`prefetchQuery` + `HydrationBoundary`)

**Term — prefetch + hydration:** the Server Component fetches the leads
list _before_ the HTML is sent, writes that result into TanStack Query's
cache shape, and sends the cache along with the page. On the browser,
`useLeads` / `useQuery` finds `["leads"]` already filled — no loading
spinner on first paint, no extra round-trip for the first list. After
that, the client cache behaves exactly as it did in Tasks 5 and 10
(filter, invalidate, optimistic update).

**What:** keep the home page a Server Component (auth + `getClaims` from
Task 2). There, `prefetchQuery` with the **same** query key as Task 5
(`["leads"]`) and a query function that can run on the server (the
browser `getLeads` in `client.ts` will not work here — this is the
actual puzzle). Wrap the client list in `HydrationBoundary` with the
dehydrated cache. `useLeads` stays the reader; it should not grow a
second fetch path. Client-side filter from Task 5 stays in the hook —
prefetch still loads the full list.

**API note (v5 current):** `queryClient.prefetchQuery` is deprecated and
will be removed in v6. Use `queryClient.query` — same cache fill, but it
**throws** if the fetch fails (unlike `prefetchQuery`, which swallowed
errors). `dehydrate` + `HydrationBoundary` are unchanged.

**Shared** `getLeads`**:** one helper that takes a `Supabase` client. The
server prefetch passes `createClient()` from `server.ts`; `useLeads`
passes the browser client. Same `select` / `order`, no second helper.

**Why last, not after Task 5 or 6:** the pattern only pays off once a
real list exists (Task 6) and once you already trust the query cache
(Task 10's optimistic update writes into that same cache). Doing it
earlier mixes two new ideas: "how the cache works" and "how the cache
gets its first fill from the server." The app is fully usable without
this — it is a first-paint / Server Component lesson, not a missing
feature. Not in `project-spec.md`; added because you asked to learn it.
Skip it if the week is gone; it is not in the same "cut first" bucket
as Task 11 — it is extra on purpose, parked at the end so it cannot
derail the core track.

**Cursor's role:** talk through `prefetchQuery` / `query`, `dehydrate`,
`HydrationBoundary`, and which Supabase client runs during prefetch vs
`useQuery` — you write the page wiring. Do not replace `useLeads` with
a server-only fetch; the point is both layers sharing one cache key.

**Extra (educational) —** `Suspense` **so the shell is not blocked:**
`await queryClient.query(...)` on the page itself delays **any** HTML
until `Supabase` returns (`TTFB` goes up). That is the core prefetch
tradeoff: first paint is the real list, but the tab waits.

The middle ground: keep `getClaims` + `redirect` in `Home` (so a
logged-out visit does not flash a loading state then bounce). Move the
prefetch into a child Server Component (`LeadsPage`) and wrap it in
`Suspense` with a presentational fallback. The `layout` streams
immediately; the fallback occupies the dashboard slot until the child
finishes; then `HydrationBoundary` still delivers the filled `["leads"]`
cache. `useLeads` stays the reader.

Do **not** use a root `src/app/loading.tsx` for this. Next wraps the
whole `page` in that file, including the auth check — `/` while logged
out would show loading, then redirect to `/login`. Nested `Suspense`
after `getClaims` avoids that.

Call the child as `<LeadsPage />`, not `LeadsPage()` — otherwise
`Suspense` never sees the Promise. Fallback needs `role="status"` so
screen readers hear that content is loading.

---

- [x] Task 13 — URL state: search params vs path params (status filter)

**Term — URL params:** two different slots in the address bar, often
mixed up as if they were one thing. **Path params** are pieces of the
path (`/leads/abc-id` via a `[id]` folder). **Search params** (query
string) are the `?key=value` part (`/?status=won`). Next App Router
reads them differently on the server (`page` props) vs the client
(`useSearchParams` / `useParams`). They are not interchangeable with
Zustand: the URL survives refresh and is shareable; the store does not.

**What:** one small apply-it-here, not a new screen: the status filter
from Tasks 4–6 should be reflected in the URL (e.g. `?status=won`, and
no param or `?status=all` for the default). Changing the filter updates
the address bar; opening/pasting that URL lands on the same filter.
Stay on the existing home list — do **not** add a `/leads/[id]` detail
page. The walkthrough must still cover path params (`[id]`, `useParams`)
so the two are distinct in your head, even though this app has no
dynamic segment yet.

**Why last:** you need a real filter control (Task 6) before the URL has
anything to hold. Doing it during Task 4 or 5 would teach routing before
you have felt Zustand-only UI state. Parked with Task 12 as extra
learning, not in `project-spec.md`. The app is usable without it.
Decide (with Cursor) whether the URL or `useLeadsUIStore` is the source
of truth for `filter` — pick one; don't keep two copies that can drift.
Modal open/edit stay in Zustand either way (those don't belong in the
URL).

**Cursor's role:** talk through path vs search, server vs client APIs
in this Next version (read the App Router docs, don't guess), and the
Zustand-vs-URL choice above — you wire the filter. No extra routes.

---

- [ ] Task 14 — Offline banner (`useOffline`)

**Term —** `useOffline`**:** an experimental Next.js 16.3 hook from
`next/offline`. It returns a boolean: `true` when the browser fires an
`offline` event or a Next navigation / prefetch / Server Action fetch
fails. Enabling `experimental.useOffline` in `next.config.ts` does two
things: it makes the hook report real state (without the flag it always
returns `false`), and it stops those Next-owned requests from throwing
when the network drops — they stay pending and retry when connectivity
returns. `useOffline` is `false` during SSR and the first hydration;
the first accurate value is after mount.

**What:** a small `OfflineBanner` Client Component (`'use client'`) that
calls `useOffline()` and, when `true`, shows a persistent banner across
the app (mount it in the root layout). Copy should match what this
feature actually retries — navigations and any Next-owned request —
not "your lead save will retry," because it will not. Use existing
shadcn/ui + Lucide if you want an icon; do not hand-build a toast
system (`Toaster` is already in the layout). Banner needs a
`role="status"` so screen readers hear the connectivity change.

**What this does _not_ cover:** `getLeads` / create / update / delete
go through TanStack Query + the browser Supabase client, not Server
Actions. Those stay on TanStack's own retry policy — the official
offline guide says that explicitly. Do not add a Server Action layer,
a `/leads/[id]` detail page, Cache Components, Partial Prefetching, or
a service worker just to "use" the hook. There is no detail page in
this app (Task 13). If a list `isPending` spinner or a mutation button
looks identical to a slow server while offline, that is expected; the
banner is what tells the user why. Do not invent a second retry loop.

**Why last:** extra learning, not in `project-spec.md`. Same parking
lot as Tasks 12–13. The app is fully usable without it. Needs a real
layout (and ideally the Task 6 list) so you can see the banner on a
screen that already has loading/pending UI. Skip it if the week is
gone. Experimental — not recommended for production; say so in the
commit message, not a PR (this repo commits on `main`).

**How to test:** official docs: `next build && next start`, not only
`next dev`. Then Chrome DevTools → Network → Offline (or airplane
mode). Toggle back to Online and confirm the banner hides and any
hung Next navigation resumes without a second click. A full page
reload while offline still fails — that needs a service worker, which
is out of scope.

**Cursor's role:** the one-line `experimental: { useOffline: true }` in
`next.config.ts` is config-only — Cursor wires it when you start this
task. Talk through what the flag retries vs what TanStack Query owns,
and how to test it. You write `OfflineBanner` and mount it in
`src/app/layout.tsx`. Likely home: `src/components/OfflineBanner.tsx`
(app chrome, not `features/leads/`).

---

## Explicitly out of scope (not tasks)

Per `project-spec.md`: multiple users/sharing, notifications/reminders,
Kanban/drag-and-drop board view. Don't build toward these "just in case."
