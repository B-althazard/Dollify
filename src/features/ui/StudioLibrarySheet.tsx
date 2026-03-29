import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import type {
  BridgePresence,
  GalleryEntry,
  SavedPreset,
} from '../library/store';

interface StudioLibrarySheetProps {
  open: boolean;
  presets: SavedPreset[];
  gallery: GalleryEntry[];
  bridge: BridgePresence;
  onOpenChange: (open: boolean) => void;
  onLoadPreset: (presetId: string) => void;
  onLoadGalleryEntry: (entryId: string) => void;
}

function formatStatus(status: GalleryEntry['status']) {
  switch (status) {
    case 'queued':
      return 'Queued';
    case 'processing':
      return 'Processing';
    case 'complete':
      return 'Saved';
    case 'failed':
      return 'Failed';
  }
}

export function StudioLibrarySheet({
  open,
  presets,
  gallery,
  bridge,
  onOpenChange,
  onLoadPreset,
  onLoadGalleryEntry,
}: StudioLibrarySheetProps) {
  const [activePanel, setActivePanel] = useState<'presets' | 'gallery'>(
    'presets',
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="sheet-overlay" />
        <Dialog.Content className="bottom-sheet" aria-describedby={undefined}>
          <div className="sheet-handle" />
          <div className="sheet-header">
            <div>
              <Dialog.Title>Studio vault</Dialog.Title>
              <p>Saved presets, bridge status, and locally stored renders.</p>
            </div>
            <Dialog.Close className="sheet-close">Close</Dialog.Close>
          </div>

          <section className="vault-bridge-card">
            <div>
              <p className="section-label">Venice bridge</p>
              <h3>{bridge.lastStatus}</h3>
            </div>
            <span className={`bridge-pill is-${bridge.signal}`}>
              {bridge.connected ? 'Connected' : 'Waiting'}
            </span>
            <p>{bridge.lastDetail}</p>
          </section>

          <div
            className="vault-toggle-row"
            role="tablist"
            aria-label="Studio vault panels"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activePanel === 'presets'}
              className={`vault-toggle ${activePanel === 'presets' ? 'is-active' : ''}`}
              onClick={() => setActivePanel('presets')}
            >
              Presets ({presets.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activePanel === 'gallery'}
              className={`vault-toggle ${activePanel === 'gallery' ? 'is-active' : ''}`}
              onClick={() => setActivePanel('gallery')}
            >
              Gallery ({gallery.length})
            </button>
          </div>

          {activePanel === 'presets' ? (
            <div className="vault-list">
              {presets.length > 0 ? (
                presets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className="vault-item"
                    onClick={() => onLoadPreset(preset.id)}
                  >
                    <div
                      className="vault-item__thumb"
                      style={
                        preset.thumbnailDataUrl
                          ? {
                              backgroundImage: `linear-gradient(rgba(16, 11, 13, 0.18), rgba(16, 11, 13, 0.72)), url(${preset.thumbnailDataUrl})`,
                            }
                          : undefined
                      }
                    />
                    <div className="vault-item__body">
                      <div className="vault-item__meta">
                        <strong>{preset.name}</strong>
                        <span>
                          {preset.snapshot.mode === 'futa' ? 'Futa' : 'Female'}
                        </span>
                      </div>
                      <p>{preset.summaryLines.join(' | ')}</p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="vault-empty">
                  No presets yet. Save one from Prompt studio.
                </p>
              )}
            </div>
          ) : (
            <div className="vault-list">
              {gallery.length > 0 ? (
                gallery.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    className="vault-item"
                    onClick={() => onLoadGalleryEntry(entry.id)}
                  >
                    <div
                      className="vault-item__thumb"
                      style={
                        entry.imageDataUrl
                          ? {
                              backgroundImage: `linear-gradient(rgba(16, 11, 13, 0.08), rgba(16, 11, 13, 0.58)), url(${entry.imageDataUrl})`,
                            }
                          : undefined
                      }
                    >
                      {!entry.imageDataUrl ? (
                        <span>{formatStatus(entry.status)}</span>
                      ) : null}
                    </div>
                    <div className="vault-item__body">
                      <div className="vault-item__meta">
                        <strong>{formatStatus(entry.status)}</strong>
                        <span>
                          {entry.provider === 'venice-userscript'
                            ? 'Venice'
                            : entry.provider}
                        </span>
                      </div>
                      <p>
                        {entry.errorMessage ??
                          entry.promptPackage.summaryLines[0] ??
                          'Tap to restore this generation state.'}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="vault-empty">
                  No local renders yet. Send a package to the Venice bridge.
                </p>
              )}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
