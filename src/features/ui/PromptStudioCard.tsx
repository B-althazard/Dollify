import {
  aspectRatioOptions,
  getPromptModelProfile,
  promptStyleOptions,
} from '../prompt/catalog';
import type { PromptPackage } from '../prompt/engine';
import type { PromptConfig } from '../schema/contracts';

interface PromptStudioCardProps {
  config: PromptConfig;
  promptPackage: PromptPackage | null;
  stale: boolean;
  onOpenConfig: () => void;
  onOpenPackage: () => void;
  onCopy: () => void;
}

export function PromptStudioCard({
  config,
  promptPackage,
  stale,
  onOpenConfig,
  onOpenPackage,
  onCopy,
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
          <strong>{model?.label ?? 'No model'}</strong>
          <span>{model?.note ?? 'Select a model profile.'}</span>
        </article>
        <article>
          <strong>{ratio?.label ?? config.aspectRatio}</strong>
          <span>{ratio?.note ?? 'Aspect ratio'}</span>
        </article>
        <article>
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
      </div>

      <div className="prompt-studio-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={onOpenConfig}
        >
          Prompt setup
        </button>
        <button
          type="button"
          className="ghost-button"
          onClick={onCopy}
          disabled={!promptPackage}
        >
          Copy latest
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={onOpenPackage}
          disabled={!promptPackage}
        >
          Review package
        </button>
      </div>
    </section>
  );
}
