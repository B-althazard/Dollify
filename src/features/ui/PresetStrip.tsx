import type { SavedPreset } from '../library/store';

interface PresetStripProps {
  presets: SavedPreset[];
  onLoadPreset: (presetId: string) => void;
  onOpenLibrary: () => void;
}

export function PresetStrip({
  presets,
  onLoadPreset,
  onOpenLibrary,
}: PresetStripProps) {
  return (
    <section className="preset-strip card-surface">
      <div className="preset-strip__header">
        <div>
          <p className="section-label">Saved looks</p>
          <h2>Preset library</h2>
        </div>
        <button type="button" className="ghost-button" onClick={onOpenLibrary}>
          Open vault
        </button>
      </div>

      {presets.length > 0 ? (
        <div className="preset-strip__scroller">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="preset-card"
              onClick={() => onLoadPreset(preset.id)}
            >
              <div
                className="preset-card__thumb"
                style={
                  preset.thumbnailDataUrl
                    ? {
                        backgroundImage: `linear-gradient(rgba(16, 11, 13, 0.18), rgba(16, 11, 13, 0.68)), url(${preset.thumbnailDataUrl})`,
                      }
                    : undefined
                }
              >
                <span>
                  {preset.snapshot.mode === 'futa' ? 'Futa' : 'Female'}
                </span>
              </div>
              <strong>{preset.name}</strong>
              <p>
                {preset.summaryLines[0] ?? 'Tap to restore this creator state.'}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <p className="preset-strip__empty">
          Save a package-ready look to keep it one tap away.
        </p>
      )}
    </section>
  );
}
