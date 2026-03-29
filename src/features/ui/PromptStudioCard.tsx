import {
  aspectRatioOptions,
  getPromptModelProfile,
  promptStyleOptions,
} from '../prompt/catalog';
import type { PromptPackage } from '../prompt/engine';
import type { PromptConfig } from '../schema/contracts';

interface PromptStudioCardProps {
  bridgeConnected: boolean;
  config: PromptConfig;
  galleryCount: number;
  presetCount: number;
  promptPackage: PromptPackage | null;
  stale: boolean;
  onOpenConfig: () => void;
  onOpenLibrary: () => void;
  onOpenPackage: () => void;
  onCopy: () => void;
  onSavePreset: () => void;
  onSendToBridge: () => void;
}

export function PromptStudioCard({
  bridgeConnected,
  config,
  galleryCount,
  presetCount,
  promptPackage,
  stale,
  onOpenConfig,
  onOpenLibrary,
  onOpenPackage,
  onCopy,
  onSavePreset,
  onSendToBridge,
}: PromptStudioCardProps) {
  const model = getPromptModelProfile(config.modelId);
  const ratio = aspectRatioOptions.find(
    (option) => option.id === config.aspectRatio,
  );
  const styles = promptStyleOptions.filter((style) =>
    config.styleIds.includes(style.id),
  );

  return (
    <section className="prompt-studio-card card-surface">
      <div className="prompt-studio-card__header">
        <div>
          <p className="section-label">Prompt studio</p>
          <h2>Package-ready output</h2>
        </div>
        <span className={`freshness-pill ${stale ? 'is-stale' : 'is-fresh'}`}>
          {promptPackage
            ? stale
              ? 'Needs refresh'
              : 'Fresh package'
            : 'Not generated'}
        </span>
      </div>

      <div className="prompt-studio-meta">
        <article>
          <p className="section-label">Model</p>
          <strong>{model?.label ?? 'No model'}</strong>
          <span>{model?.note ?? 'Select a model profile.'}</span>
        </article>
        <article>
          <p className="section-label">Canvas</p>
          <strong>{ratio?.label ?? config.aspectRatio}</strong>
          <span>{ratio?.note ?? 'Aspect ratio'}</span>
        </article>
        <article>
          <p className="section-label">Finish</p>
          <strong>
            {styles.length > 0
              ? styles.map((style) => style.label).join(', ')
              : 'No style finish'}
          </strong>
          <span>
            {styles.length > 0
              ? 'Current package finish'
              : 'Optional polish is off'}
          </span>
        </article>
        <article>
          <p className="section-label">Vault</p>
          <strong>{presetCount} presets</strong>
          <span>One-tap creator recalls</span>
        </article>
        <article>
          <p className="section-label">Bridge</p>
          <strong>{galleryCount} gallery items</strong>
          <span>
            {bridgeConnected
              ? 'Bridge is listening'
              : 'Bridge not detected yet'}
          </span>
        </article>
      </div>

      <div className="prompt-studio-actions">
        <button
          type="button"
          className="secondary-button prompt-action-button"
          onClick={onOpenConfig}
        >
          Prompt setup
        </button>
        <button
          type="button"
          className="ghost-button prompt-action-button"
          onClick={onCopy}
          disabled={!promptPackage}
        >
          Copy latest
        </button>
        <button
          type="button"
          className="primary-button prompt-action-button"
          onClick={onOpenPackage}
          disabled={!promptPackage}
        >
          Review package
        </button>
        <button
          type="button"
          className="secondary-button prompt-action-button"
          onClick={onSavePreset}
        >
          Save preset
        </button>
        <button
          type="button"
          className="ghost-button prompt-action-button"
          onClick={onOpenLibrary}
        >
          Open vault
        </button>
        <button
          type="button"
          className="primary-button prompt-action-button"
          onClick={onSendToBridge}
        >
          Send to Venice
        </button>
      </div>
    </section>
  );
}
