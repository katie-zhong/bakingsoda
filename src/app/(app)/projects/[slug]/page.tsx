/**
 * Recipe view — hero media slot, ingredients strip (✓ keep / ✕ for
 * auto-extracted), inspiration wall with arrangement control,
 * "how i made it" timeline, "out in the world" artifact previews.
 * Design contract: Figma "02 · project — recipe view".
 */
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <main className="p-8 text-sm text-zinc-500">recipe: {slug}</main>;
}
