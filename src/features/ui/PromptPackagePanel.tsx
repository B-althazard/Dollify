import type { PromptPackage } from '../prompt/engine';

interface PromptPackagePanelProps {
  promptPackage: PromptPackage;
  onCopyPositive: () => void;
}

function PromptSectionCard({
  title,
  body,
  onCopy,
}: {
  title: string;
  body: string;
  onCopy?: () => void;
}) {
  return (
    <article className="prompt-section-card">
      <div className="prompt-section-card__header">
        <div>
          <p className="section-label">Package section</p>
          <h3>{title}</h3>
        </div>
        {onCopy ? (
          <button type="button" className="ghost-button" onClick={onCopy}>
            Copy
          </button>
        ) : null}
      </div>
      <p className="prompt-body">{body}</p>
    </article>
  );
}

export function PromptPackagePanel({
  promptPackage,
  onCopyPositive,
}: PromptPackagePanelProps) {
  return (
    <div className="prompt-package-panel">
      <PromptSectionCard
        title="Positive prompt"
        body={promptPackage.positivePrompt}
        onCopy={onCopyPositive}
      />
      <PromptSectionCard
        title="Negative prompt"
        body={promptPackage.negativePrompt}
      />

      <article className="prompt-section-card">
        <div className="prompt-section-card__header">
          <div>
            <p className="section-label">Guidance</p>
            <h3>Generation notes</h3>
          </div>
        </div>
        <div className="prompt-list-group">
          {promptPackage.modelHints.map((hint) => (
            <p key={hint} className="prompt-list-line">
              {hint}
            </p>
          ))}
          {promptPackage.guidanceLines.map((line) => (
            <p key={line} className="prompt-list-line">
              {line}
            </p>
          ))}
          {promptPackage.summaryLines.map((line) => (
            <p key={line} className="prompt-list-line">
              {line}
            </p>
          ))}
          {promptPackage.warnings.map((warning) => (
            <p key={warning} className="prompt-list-line is-warning">
              {warning}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}
