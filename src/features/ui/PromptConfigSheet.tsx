import * as Dialog from '@radix-ui/react-dialog';
import {
  aspectRatioOptions,
  getPromptModelProfile,
  getSupportedStyleIds,
  promptModelProfiles,
  promptStyleOptions,
} from '../prompt/catalog';
import type { PromptConfig } from '../schema/contracts';

interface PromptConfigSheetProps {
  open: boolean;
  config: PromptConfig;
  onOpenChange: (open: boolean) => void;
  onChange: (value: Partial<PromptConfig>) => void;
}

export function PromptConfigSheet({
  open,
  config,
  onOpenChange,
  onChange,
}: PromptConfigSheetProps) {
  const supportedStyleIds = getSupportedStyleIds(config);
  const selectedModel = getPromptModelProfile(config.modelId);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="sheet-overlay" />
        <Dialog.Content className="bottom-sheet" aria-describedby={undefined}>
          <div className="sheet-handle" />
          <div className="sheet-header">
            <div>
              <Dialog.Title>Prompt setup</Dialog.Title>
              <p id="prompt-config-description">
                Tune the package profile before generating or copying.
              </p>
            </div>
            <Dialog.Close className="sheet-close">Close</Dialog.Close>
          </div>

          <div className="prompt-config-group">
            <p className="section-label">Model family</p>
            <div className="sheet-grid">
              {promptModelProfiles.map((profile) => {
                const selected = profile.id === config.modelId;

                return (
                  <button
                    key={profile.id}
                    type="button"
                    className={`sheet-option ${selected ? 'is-selected' : ''}`}
                    onClick={() => {
                      const nextSupportedStyles = profile.supportedStyleIds;
                      onChange({
                        modelId: profile.id,
                        styleIds: config.styleIds.filter((styleId) =>
                          nextSupportedStyles.includes(styleId),
                        ),
                      });
                    }}
                  >
                    <strong>{profile.label}</strong>
                    <span>{profile.note}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="prompt-config-group">
            <p className="section-label">Aspect ratio</p>
            <div className="aspect-ratio-strip">
              {aspectRatioOptions.map((ratio) => {
                const selected = ratio.id === config.aspectRatio;

                return (
                  <button
                    key={ratio.id}
                    type="button"
                    className={`option-chip ${selected ? 'is-selected' : ''}`}
                    onClick={() => onChange({ aspectRatio: ratio.id })}
                  >
                    <span>{ratio.label}</span>
                    <small>{ratio.note}</small>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="prompt-config-group">
            <p className="section-label">Style finish</p>
            <p className="field-helper">
              {selectedModel?.label ?? 'Selected model'} supports curated
              finishing passes.
            </p>
            <div className="sheet-grid">
              {promptStyleOptions.map((style) => {
                const selected = config.styleIds.includes(style.id);
                const supported = supportedStyleIds.has(style.id);

                return (
                  <button
                    key={style.id}
                    type="button"
                    className={`sheet-option ${selected ? 'is-selected' : ''}`}
                    onClick={() => {
                      if (!supported) {
                        return;
                      }

                      onChange({
                        styleIds: selected
                          ? config.styleIds.filter(
                              (styleId) => styleId !== style.id,
                            )
                          : [...config.styleIds, style.id],
                      });
                    }}
                    disabled={!supported}
                  >
                    <strong>{style.label}</strong>
                    <span>{style.note}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
