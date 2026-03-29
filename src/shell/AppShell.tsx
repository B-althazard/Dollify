export function AppShell() {
  return (
    <main className="app-frame">
      <div className="app-shell">
        <header className="top-status-card">
          <div>
            <p className="eyebrow">Schema-driven creator</p>
            <h1>Dollify</h1>
          </div>
          <div className="status-cluster">
            <span className="mode-pill">Female + Futa-Female</span>
            <span className="validity-pill">Foundations in progress</span>
          </div>
        </header>

        <section className="creator-placeholder card-surface">
          <p className="section-label">Creator shell</p>
          <h2>Phone-first workspace scaffold</h2>
          <p>
            The Phase 1 shell reserves space for schema categories, rule-aware controls,
            and touch-safe actions without introducing free-text input.
          </p>
        </section>

        <section className="placeholder-grid">
          <article className="card-surface">
            <p className="section-label">Status area</p>
            <p>Compact progress, mode chips, and validation will live here.</p>
          </article>
          <article className="card-surface">
            <p className="section-label">Category rail</p>
            <p>Swipe and tap category navigation is staged for the creator body.</p>
          </article>
        </section>

        <footer className="bottom-action-bar">
          <button type="button" className="ghost-button" disabled>
            Randomize
          </button>
          <button type="button" className="secondary-button" disabled>
            Reset
          </button>
          <button type="button" className="primary-button" disabled>
            Continue
          </button>
        </footer>
      </div>
    </main>
  );
}
