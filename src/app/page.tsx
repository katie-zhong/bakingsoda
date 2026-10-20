/**
 * Serve the complete interactive demo at the deployed app's root URL. Keeping
 * it as a static document preserves its prototype interactions without
 * requiring server data or hydration.
 */
export default function Home() {
  return (
    <main className="prototype-shell">
      <iframe
        className="prototype-frame"
        src="/bakingsoda-demo.html"
        title="bakingsoda interactive demo"
      />
    </main>
  );
}
