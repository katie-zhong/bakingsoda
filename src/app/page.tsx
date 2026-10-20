/**
 * Serve the complete, self-contained interactive prototype at the deployed
 * app's root URL. Keeping it as a static document preserves its canvas and
 * localStorage based interactions without requiring server data or hydration.
 */
export default function Home() {
  return (
    <main className="prototype-shell">
      <iframe
        className="prototype-frame"
        src="/prototype.html"
        title="bakingsoda interactive prototype"
      />
    </main>
  );
}
