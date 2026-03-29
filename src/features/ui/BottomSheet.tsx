import * as Dialog from '@radix-ui/react-dialog';
import type { FieldRuleState } from '../rules/engine';
import type { CreatorField } from '../schema/contracts';

interface BottomSheetProps {
  field: CreatorField | undefined;
  state: FieldRuleState | undefined;
  values: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (values: string[]) => void;
}

export function BottomSheet({
  field,
  state,
  values,
  open,
  onOpenChange,
  onChange,
}: BottomSheetProps) {
  if (!field || !state) {
    return null;
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="sheet-overlay" />
        <Dialog.Content
          className="bottom-sheet"
          aria-describedby={`${field.id}-sheet-description`}
        >
          <div className="sheet-handle" />
          <div className="sheet-header">
            <div>
              <Dialog.Title>{field.label}</Dialog.Title>
              <Dialog.Description id={`${field.id}-sheet-description`}>
                {field.helperText ?? field.description}
              </Dialog.Description>
            </div>
            <Dialog.Close className="sheet-close">Close</Dialog.Close>
          </div>

          <div className="sheet-grid">
            {field.options.map((option) => {
              const selected = values.includes(option.id);

              return (
                <button
                  key={option.id}
                  type="button"
                  className={`sheet-option ${selected ? 'is-selected' : ''}`}
                  onClick={() => {
                    onChange([option.id]);
                    onOpenChange(false);
                  }}
                  disabled={state.disabled}
                >
                  <strong>{option.label}</strong>
                  {option.description ? (
                    <span>{option.description}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
