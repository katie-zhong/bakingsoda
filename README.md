# bakingsoda

a shareable project board for makers. 
keep track of what work inspires you, process artifacts, and what you made <3

- **paste anything** — a tweet, a pin, a repo, a pdf — and it lands on
  the counter, unfurled into a card
- **projects are recipes** — ingredients (tools, fonts, extracted
  palettes), the inspiration that fed them, a "how i made it" timeline,
  and the artifacts you shipped
- **private by default** — publishing anything is an explicit choice
- **embeddable** — your public board drops into any portfolio with one
  script tag. your portfolio's portfolio.

status vocabulary: `fermenting → in the oven → fully baked` (and
`flat`, said lovingly).

## reading the code

Start with [`ARCHITECTURE.md`](ARCHITECTURE.md) — it's the map. Then
[`src/db/schema.ts`](src/db/schema.ts), which is the whole idea in one
file. Decisions with tradeoffs are recorded in
[`docs/decisions/`](docs/decisions/) as ADRs.

## running locally

```bash
npm install
cp .env.example .env.local   # add your Neon DATABASE_URL
npx drizzle-kit push          # create tables from src/db/schema.ts
npm run dev                   # http://localhost:3000
```

## stack

Next.js (App Router) · TypeScript · Tailwind · Drizzle ORM ·
Neon Postgres · Vercel. Reasoning in
[ADR-0001](docs/decisions/0001-stack.md).
