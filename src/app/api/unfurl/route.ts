/**
 * POST { url } → Unfurled metadata. The paste bar calls this, then the
 * caller inserts the item. Kept as a separate route (rather than doing
 * both here) so the future queue swap (ADR-0004) changes one file.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { unfurl } from "@/lib/unfurl";

const Body = z.object({ url: z.string().url() });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "That doesn't look like a link." }, { status: 400 });
  }
  return NextResponse.json(await unfurl(parsed.data.url));
}
