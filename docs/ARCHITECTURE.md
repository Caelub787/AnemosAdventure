# ArcanaVTT Architecture

This document describes the first-version (MVP) architecture. It is intentionally a
small end-to-end slice, not the full platform described in the product spec — see
"Deferred to later phases" at the bottom.

## Monorepo layout

```
apps/
  web/             Next.js 16 (App Router) — the whole product UI, deploys to Vercel
  realtime-sync/   Hocuspocus (Yjs) WebSocket server — deploys to Fly.io
packages/
  data-access/     Supabase repository layer (all DB reads/writes go through here)
  db-types/        Hand-authored mirror of the Supabase schema (Database type)
  realtime/        Shared React hooks: usePresence, useYDoc, sync status store
  ui/              Shared presentational components (Button, Card, StatusPill, ...)
  config/          Shared tsconfig base
supabase/
  migrations/      Version-controlled SQL migrations (source of truth for schema)
```

## Why two deployables instead of one

Next.js on Vercel cannot hold a long-lived WebSocket connection (serverless/edge
functions have execution time limits). Real-time collaborative editing (Yjs) needs a
process that keeps documents in memory and merges updates continuously, so that one
piece — `apps/realtime-sync` — runs as an always-on Node process on Fly.io instead.
Everything else (pages, auth, REST-ish data access, presence, notifications) runs
through Supabase directly from the Next.js app and needs no custom backend.

## Data layer

- **Supabase Postgres** is the single source of truth. Every reusable object
  (project, world entry, map, campaign) that other sections need to reference shares
  one identity via the `project_nodes` registry table — see
  `supabase/migrations/0001_init.sql`. This is what lets future phases link a map
  marker straight to a World Builder entry without redesigning IDs.
- **Row Level Security (RLS) is the primary permission boundary**, not just an
  app-layer check. The client talks to Supabase directly for Postgres Changes
  subscriptions and Realtime Presence, which never pass through a custom API — RLS is
  the only enforcement point those paths can't bypass. `has_project_role()` and
  `is_admin()` are the two helper functions every policy is built on.
- **`packages/data-access`** wraps every table/RPC call in a typed function so
  application code never writes raw Supabase queries inline, and the underlying
  provider could be swapped later without touching every call site.

## Real-time architecture

Two transports, one shared client library (`packages/realtime`):

| Concern | Transport | Why |
|---|---|---|
| Collaborative doc/map editing | Yjs + Hocuspocus (`apps/realtime-sync`) | CRDT merge semantics, self-hosted, open source — no vendor lock-in for the core "live collaboration" feature |
| Presence, cursors, live notifications, live content publishing | Supabase Realtime (Presence + Postgres Changes) | Simple pub/sub, already included in the Supabase plan, no extra infrastructure needed |

`useYDoc` (World Builder + Map Maker) and `usePresence` (dashboard, map, campaign
lobby) are the two hooks every collaborative feature is built on, so there is one
implementation instead of three.

The `apps/realtime-sync` server is the one place an application-layer permission
check is load-bearing rather than RLS: it verifies the Supabase JWT and looks up the
caller's `project_members` role directly against Postgres before allowing a
WebSocket connection to a given document (see `apps/realtime-sync/src/auth.ts`).

## Sync status

`packages/realtime/src/syncStatusStore.ts` is a small Zustand store that derives one
of `saved | saving | offline | reconnecting | synchronizing | sync_failed | conflict`
from `navigator.onLine`, the Hocuspocus provider's connection state, and pending
mutation state. `packages/ui/src/StatusPill.tsx` renders it with both an icon and a
label, never color alone.

## PWA

Serwist (`@serwist/next`) generates the service worker from `apps/web/app/sw.ts`.
Registration is manual (`components/RegisterServiceWorker.tsx`) and update handling
is non-disruptive: a waiting worker only takes over when the user clicks "Update
now" (`hooks/useServiceWorkerUpdate.ts`), never automatically mid-session.

Serwist bundles the service worker via a webpack build step, which doesn't yet run
under Turbopack (Next.js 16's default bundler) — `apps/web`'s `build` script
explicitly passes `--webpack` for this reason. `next dev` still uses Turbopack
(faster iteration); Serwist is disabled entirely in development, so this doesn't
affect it.

## Deferred to later phases

Full character sheets and the no-code custom-system builder; dice roller; fog of
war/dynamic lighting; initiative tracker and full combat tooling; full map tool
palette (multiple editable layers, drawing/terrain tools, asset marketplace); graph
view and full-text/ranked search (the current search is an `ILIKE` stub); email/push
notification delivery; per-field permission overrides beyond the 6 project roles;
billing; native mobile apps beyond the PWA; i18n; audit logging.
