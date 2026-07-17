/**
 * Public profile — spotlights + embed snippet. PUBLIC ROWS ONLY,
 * enforced in the query (see ARCHITECTURE.md invariants).
 * Design contract: Figma "03 · public profile + embed".
 */
export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  return <main className="p-8 text-sm text-zinc-500">@{handle}&rsquo;s lab</main>;
}
