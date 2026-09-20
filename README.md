# Leads Tracker

A single-user dashboard for tracking freelance leads from first contact to won or lost.

This is an **educational project** that is also a real personal tool. The learning-stack code (schema, types, hooks, forms, mutations, SQL) was written by hand to practice the libraries below in one small app — not as a demo of every feature each library has.

## What it does

- Sign in with email and password (`/login`). There is no signup screen; the account is created in the Supabase dashboard.
- The home page (`/`) is protected. A missing session redirects to `/login`.
- KPI counts per status, a status filter, and the leads list.
- Add / edit a lead in a modal.
- Change status inline on each row (optimistic update).
- Delete a lead after a confirmation dialog.
- Empty states for “no leads yet” and “no leads with this status”.
- List sorted by `next_follow_up` (soonest first, from Postgres).
- Filter reflected in the URL (`/?status=won`). Refresh or paste that URL and the same filter is on.
- Offline banner when the browser reports no network. Lead saves are blocked in the UI; they are not queued.

Out of scope on purpose: sharing leads, notifications, and a Kanban board.

## Stack

Versions from `package.json`:

| Layer | Package |
| --- | --- |
| App | Next.js `16.3.3` (App Router), React `19.2.8`, TypeScript `^5` |
| UI | Tailwind CSS `^4`, shadcn/ui, Lucide |
| Data | Supabase (`@supabase/supabase-js` `^2.112.4`, `@supabase/ssr` `^0.12.5`) |
| Server state | TanStack Query `^5.102.8` |
| Forms | React Hook Form `^7.88.0` + Zod `^4.6.4` + `@hookform/resolvers` |
| UI state | Zustand `^5.0.15` |
| Dates | date-fns `^4.4.0` |

## Topics applied, by stack

### Next.js (App Router)

- Server Components for the home auth check (`getClaims` + `redirect`) and for prefetching leads.
- Client Components for the dashboard, form, and mutations (`"use client"`).
- `src/proxy.ts` — Next.js 16 request proxy. It creates a Supabase server client, calls `getClaims()`, and writes refreshed auth cookies onto the response. Without this, a Server Component cannot persist a token refresh.
- Nested `Suspense` **after** the auth check, with `LeadsDashboardFallback`. A root `loading.tsx` was avoided so a logged-out visit to `/` does not flash a loader then bounce to `/login`.
- `src/app/error.tsx` — route error UI. The recover callback in this Next version is `retry`, not `reset`.
- Search params as URL state for the status filter (`useSearchParams` + `history.replaceState`). Path params (`[id]`) are not used; there is no `/leads/[id]` page.
- `experimental.useOffline` is on in `next.config.ts`. The banner itself listens to `window` `online` / `offline` events, not the `useOffline` hook.

### TypeScript

- Hand-written `Lead` and `LeadStatus` in `src/features/leads/types.ts`, matching the table.
- Form values come from Zod: `LeadFormType = z.infer<typeof leadSchema>`.

### Supabase (Postgres + Auth)

- One table, `public.leads`, in `supabase/migrations/20260907205902_create-leads-table.sql`.
- `CHECK` on `status`: `idea`, `contacted`, `proposal_sent`, `negotiating`, `won`, `lost`.
- Row Level Security: policy `users_own_leads` uses `auth.uid() = user_id` for both `USING` and `WITH CHECK`. `anon` has no table grants; `authenticated` can `select` / `insert` / `update` / `delete` only their rows.
- Two clients: `src/lib/supabase/client.ts` (browser) and `server.ts` (server). Shared `getLeads(supabase)` takes whichever client is passed in.
- Session via `getClaims()` (token payload, not a full profile fetch).
- `signInWithPassword` only. No signup UI.

### TanStack Query

- One cache key: `["leads"]`.
- `useLeads` → `useQuery`. The full list is fetched once; the status filter is applied in the hook (`data.filter`), not in the query key.
- Create / update / delete: `useMutation` then `invalidateQueries({ queryKey: ["leads"] })`.
- Inline status: optimistic update — `onMutate` writes the new status into the cache, `onError` rolls back to `previousLeads`, `onSettled` invalidates.
- First paint: the server runs `queryClient.query` (not deprecated `prefetchQuery`), then `dehydrate` + `HydrationBoundary`. The client `useLeads` reads the same key; it does not have a second fetch path.
- `QueryClientProvider` in `src/app/Provider.tsx` with `staleTime: 60_000`.

### Zod + React Hook Form

- One schema, `leadSchema`: `name` required, `source` / `notes` / `next_follow_up` optional, `status` an enum of the six values.
- Modal form: `useForm` + `zodResolver(leadSchema)`. Add vs edit is chosen from the Zustand modal mode, then `useCreateLead` or `useUpdateLead`.

### Zustand

- UI-only store `useLeadsUIStore`: modal open, mode (`add` | `edit`), and which lead is being edited.
- The status filter does **not** live here. It lives in the URL so it survives refresh.

### Tailwind v4, shadcn/ui, Lucide

- Brand tokens (`forest`, `cream`, `mustard`, `sage`) wired in `src/app/globals.css`.
- Primitives used as-is: Dialog, Select, Table, Card, Button, Input, and the rest under `src/components/ui/`.
- Icons from Lucide only.

### date-fns

- Display formatting for `next_follow_up` in the list (`parseISO` + `format`). Sort itself is `.order("next_follow_up")` in `getLeads`.

### Offline

- `OfflineBanner` in the root layout.
- `blockIfOffline()` in the add/edit submit, delete confirm, and inline status change: toast and skip the mutation if `navigator.onLine` is false. A full reload while offline still cannot render the server page; `error.tsx` is that fallback.

Short notes written while learning two of these topics: `docs/learning/proxy.txt`, `docs/learning/query-client.txt`.

## Layout

```
src/
  app/                  # routes: /, /login, layout, error
  proxy.ts              # auth cookie refresh
  features/leads/
    api/                # getLeads, createLead, updateLead, updateLeadStatus, deleteLead
    hooks/              # useQuery / useMutation wrappers only
    components/         # dashboard, list, modal, filter, KPIs
    schema.ts           # leadSchema
    store.ts            # useLeadsUIStore
    types.ts
  lib/supabase/         # browser + server clients, signIn, getClaims
  components/ui/        # shadcn
supabase/migrations/    # leads table + RLS
```

Components do not call `supabase.from(...)` directly. They go through the `use*` hooks, which call the helpers in `api/`.

## Run locally

1. Clone the repo and install:

   ```bash
   npm install
   ```

2. Create a Supabase project. In the SQL editor, run `supabase/migrations/20260907205902_create-leads-table.sql`.

3. In Authentication, create the one user you will sign in as (email + password). This app has no signup page.

4. In the project root, add `.env.local` (`.env*` is gitignored):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   ```

   Values come from the Supabase project API settings. Do not put the `service_role` key in this app.

5. Start the app:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) and sign in.
