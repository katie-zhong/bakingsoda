# architecture

This document is the map. Read it before reading code. Decisions with
tradeoffs live in `docs/decisions/` as ADRs; this file explains *what is
where and why the shape is the shape*.

## the one idea

bakingsoda stores a **provenance graph**:

```
items (inspiration in)  →  projects (the work)  →  artifacts (output out)
```

Pinterest owns the input. GitHub owns the output. bakingsoda owns the
arrow. Every feature — the board, recipe pages, the public profile, the
embed, the future graph view and fork button — is a *view over this
graph*. When deciding where new code goes, ask: is this changing the
graph, or rendering it?

## directory map

```
src/
  db/
    schema.ts        ← the data model. START HERE. heavily commented.
    index.ts         ← database client (Neon over HTTP, serverless-safe)
  lib/
    unfurl.ts        ← paste a URL, get title/description/image/kind
    id.ts            ← nanoid helper — every table uses text ids
  app/
    page.tsx                 ← marketing landing (public)
    (app)/                   ← signed-in surfaces, share app chrome
      board/page.tsx         ← the masonry board ("the counter" + filters)
      projects/[slug]/page.tsx ← recipe view (ingredients, timeline, artifacts)
    u/[handle]/page.tsx      ← public profile (spotlights + embed snippet)
    embed/[handle]/page.tsx  ← the iframe target. read-heavy, edge-cached.
    api/
      unfurl/route.ts        ← POST url → unfurled metadata
docs/
  decisions/         ← ADRs: why the stack, model, embed, capture pipeline
```

Route groups: `(app)` wraps authenticated pages in shared chrome
(sidebar, paste bar) without affecting URLs. `u/` and `embed/` are
public and deliberately share **zero** components with the private app —
public surfaces must never accidentally render private data because a
component defaulted the wrong way.

## request flows worth knowing

**Capture ("paste anything"):** client POSTs a URL to `/api/unfurl` →
server fetches the page, reads oEmbed/OpenGraph tags, classifies `kind`
(tweet / pin / paper / repo / …) → inserts an `items` row → board
revalidates. Unfurling runs inline for now; the queue seam is documented
in ADR-0004.

**Embed:** a portfolio site includes our script tag → the script
injects an iframe pointing at `/embed/[handle]` → that route renders
only `visibility = public` rows and ships with long cache lifetimes
(see ADR-0003). Read-heavy, rarely-changing, perfect cache candidate.

## scaling posture (the pre-plan, honestly labeled)

The app is **stateless** — all state is in Postgres — so it scales
horizontally on Vercel with zero work. The two seams that flex when
thousands of users show up, documented but *deliberately not built yet*:

1. **Unfurl queue.** Inline unfurling blocks a request for ~1s per
   paste. Fine at small scale. At volume, `/api/unfurl` enqueues and a
   worker fills metadata in; the schema already tolerates null metadata,
   so this swap touches one file.
2. **Embed caching.** `/embed/*` responses are cacheable per-handle and
   invalidated when that user publishes. This is what survives someone's
   launch-day traffic, because the spike hits the embed, not the app.

Building these before they're needed would be cosplay. Knowing exactly
where they go is engineering.

## invariants

- **Private by default.** Every `visibility` column defaults `private`.
- **Nobody types dates.** `startedAt`/`finishedAt` derive from activity.
- **Auto-extraction proposes, the user disposes.** `autoExtracted`
  ingredients render with ✓ keep / ✕ until `confirmed`.
- **Public surfaces render public rows only,** enforced in queries, not
  in components.
