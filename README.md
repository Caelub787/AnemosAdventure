# ArcanaVTT

A connected virtual tabletop, world-building/notes workspace, and fantasy map maker
for D&D, other RPG systems, and no-code custom systems — built as one shared
platform rather than three separate tools.

This is the first (MVP) version: it proves the shared architecture — accounts,
projects, permissions, real-time collaboration, and the code/content update split —
works end-to-end, ahead of building out the full feature set.

- **Architecture overview:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- **Local dev & deployment setup:** [`docs/SETUP.md`](docs/SETUP.md)

## Monorepo

```
apps/web             Next.js 16 app — the product
apps/realtime-sync    Hocuspocus (Yjs) server for collaborative editing
packages/*            Shared data access, realtime hooks, UI, types
supabase/             Database schema (migrations) and local dev config
```

## Quick start

```bash
pnpm install
pnpm dev
```

See [`docs/SETUP.md`](docs/SETUP.md) for Supabase/Vercel/Fly.io account setup,
environment variables, and the branching/deployment workflow.
