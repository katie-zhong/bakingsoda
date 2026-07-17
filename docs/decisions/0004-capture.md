# ADR-0004: capture pipeline — inline unfurl now, queue seam later

**Status:** accepted · 2026-07-17

## Context
"Paste anything" must feel instant, but unfurling (fetch page, parse
oEmbed/OpenGraph, classify kind) takes ~0.5–2s and depends on third
parties. Also: the X API bookmarks endpoint is behind a paid tier
(~$200/mo), so bulk import is NOT a v1 dependency — paste-a-link is the
primary capture interaction by design, import is a later decision made
with usage data.

## Decision
v1 unfurls inline in `/api/unfurl` with a short timeout; on failure the
item saves with the bare URL and metadata stays null (schema tolerates
this). The UI shows the card immediately and hydrates metadata when it
arrives. When volume demands it, the same route enqueues instead and a
background worker fills metadata — a one-file swap, documented here so
future-us doesn't rediscover it.

## Consequences
Occasional cards with no preview if a site blocks us — acceptable, the
link still works. No queue infrastructure to run at small scale.
