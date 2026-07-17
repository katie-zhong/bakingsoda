# bakingsoda — instructions for Claude Code

Read ARCHITECTURE.md first, then src/db/schema.ts. Decisions live in
docs/decisions/ as ADRs — add a new ADR when making a choice with real
tradeoffs, and ask Katie before deciding; this project is deliberately
a vehicle for her to build architecture-decision judgment.

Conventions:
- Comment for a reader: every module opens with a "why this exists"
  block. Match the existing voice (lowercase product copy, plain verbs).
- Private by default; public surfaces (u/, embed/) query public rows
  only and share no components with the private app.
- Design contract is the Figma file "bakingsoda — mockups". Neutral
  gray canvas, white cards, off-black ink, ONE soda-orange accent;
  all other color enters as data. Radius: containers 14–16, interactive
  elements pill. Never ship anything that looks AI-generated.
- Status vocabulary: fermenting / in the oven / fully baked / flat.
