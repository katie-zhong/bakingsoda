# ADR-0002: model the provenance graph, not two lists

**Status:** accepted · 2026-07-17

## Context
The differentiating data is the LINK between inspiration and shipped
work. A naive model (items belong to projects) makes that link a
foreign key and destroys it: one tweet inspiring three projects would
need three copies.

## Decision
`project_items` is a many-to-many edge table with `position` and
`caption`, making inspiration↔project a true graph. Fork lineage is
pre-planned as nullable `forked_from_*` columns on items and projects —
unbuilt in v1, but the graph can already express "your output became my
input," which is the trickle-down feature.

## Consequences
Queries join through the edge table (fine, indexed both directions).
The post-MVP obsidian-style graph view and the taste-timeline slider
need zero schema changes — they are visualizations of existing rows
(`project_items` edges and `saved_at`/`occurred_at` timestamps).
