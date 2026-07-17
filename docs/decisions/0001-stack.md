# ADR-0001: Next.js + TypeScript + Postgres (Neon) + Drizzle + Vercel

**Status:** accepted · 2026-07-17

## Context
bakingsoda needs to be (1) legible if open-sourced, (2) a learning
vehicle for technical architecture decisions, (3) scalable to thousands
of users without rework.

## Options considered
- **Next.js + TS** vs SvelteKit vs Remix: all fine technically. Next is
  the lingua franca of the design-engineering community this product
  serves — maximizes readers and contributors on open source.
- **Drizzle** vs Prisma: Prisma is more common; Drizzle's schema is
  TypeScript that reads almost like SQL. Chosen for SQL literacy — you
  learn databases, not ORM magic. Migrations stay inspectable.
- **Neon Postgres** vs Supabase vs SQLite: the core entity is a graph of
  relations — relational is correct. Neon's serverless driver works over
  HTTP (no connection-pool pain on Vercel) and the free tier goes far.
- **Vercel** vs self-host: zero-ops, preview deploys per branch, and the
  stateless-app scaling story is free.

## Consequences
Locked into the React ecosystem (acceptable: it's where the audience
is). Neon HTTP driver has slightly higher per-query latency than a
pooled TCP connection — irrelevant at our read patterns, revisit if a
hot path ever needs transactions in a tight loop.
