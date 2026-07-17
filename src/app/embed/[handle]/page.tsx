/**
 * The iframe target for the embed (ADR-0003). Renders public rows
 * only. This route carries launch-day traffic, so it gets aggressive
 * edge caching (s-maxage + stale-while-revalidate), purged on publish.
 */
export const revalidate = 300; // seconds — the cache half of ADR-0003

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  return (
    <main className="p-4 text-sm text-zinc-500">
      @{handle}&rsquo;s board, embeddable
    </main>
  );
}
