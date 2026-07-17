/**
 * Unfurling: paste a URL, get back enough metadata to render a card.
 * Strategy (ADR-0004): classify by hostname first (cheap, reliable),
 * then fetch the page and read OpenGraph/oEmbed tags with a short
 * timeout. Failure is fine — the item saves with a bare URL and the
 * schema tolerates null metadata.
 */
export type Unfurled = {
  kind:
    | "tweet" | "pin" | "video" | "article" | "paper"
    | "figma" | "image" | "pdf" | "repo" | "other";
  title: string | null;
  description: string | null;
  authorHandle: string | null;
  sourcePlatform: string | null;
  imageUrl: string | null;
};

/** Hostname → kind/platform. Extend as new sources show up in the wild. */
export function classify(url: URL): Pick<Unfurled, "kind" | "sourcePlatform"> {
  const h = url.hostname.replace(/^www\./, "");
  if (h === "x.com" || h === "twitter.com") return { kind: "tweet", sourcePlatform: "twitter" };
  if (h.endsWith("pinterest.com")) return { kind: "pin", sourcePlatform: "pinterest" };
  if (h === "youtu.be" || h.endsWith("youtube.com")) return { kind: "video", sourcePlatform: "youtube" };
  if (h.endsWith("figma.com")) return { kind: "figma", sourcePlatform: "figma" };
  if (h.endsWith("arxiv.org")) return { kind: "paper", sourcePlatform: "arxiv" };
  if (h === "github.com") return { kind: "repo", sourcePlatform: "github" };
  if (url.pathname.endsWith(".pdf")) return { kind: "pdf", sourcePlatform: null };
  return { kind: "article", sourcePlatform: h };
}

export async function unfurl(rawUrl: string): Promise<Unfurled> {
  const url = new URL(rawUrl); // throws on garbage — caller handles
  const base: Unfurled = {
    ...classify(url),
    title: null, description: null, authorHandle: null, imageUrl: null,
  };
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(4000),
      headers: { "user-agent": "bakingsoda-unfurl/0.1" },
    });
    const html = await res.text();
    // Minimal OpenGraph read. Deliberately not a full parser yet —
    // upgrade to one when real-world pages demand it.
    const og = (prop: string) =>
      html.match(
        new RegExp(`<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']*)`, "i"),
      )?.[1] ?? null;
    base.title = og("title") ?? html.match(/<title[^>]*>([^<]*)/i)?.[1] ?? null;
    base.description = og("description");
    base.imageUrl = og("image");
  } catch {
    // Timeout or blocked fetch: save the bare URL, hydrate never. Fine.
  }
  return base;
}
