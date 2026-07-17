# ADR-0003: embed = script tag → iframe → cached public route

**Status:** accepted · 2026-07-17

## Context
The embed is the key feature: a live board inside someone's portfolio.
Options: (a) iframe, (b) web component fetching JSON client-side,
(c) build-time static export.

## Decision
Script tag that injects an iframe pointing at `/embed/[handle]`.
Iframes give style isolation for free (our CSS can't break their site,
theirs can't break ours) and a hard security boundary (their JS cannot
read our DOM). The wrapper script exists so we can later add auto-height
messaging and theming params without embedders changing their snippet.

## Consequences
`/embed/*` must be fast and cacheable: render public rows only,
`Cache-Control: public, s-maxage=300, stale-while-revalidate=86400`,
purge on publish. SEO inside an iframe is poor — acceptable; the
profile page at `/u/[handle]` is the indexable surface.
