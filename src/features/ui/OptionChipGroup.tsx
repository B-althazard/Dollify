import type { CreatorField } from '../schema/contracts';
import type { FieldRuleState } from '../rules/engine';

interface OptionChipGroupProps {
  field: CreatorField;
  state: FieldRuleState;
  values: string[];
  onChange: (values: string[]) => void;
  onOpenSheet?: () => void;
}

export function OptionChipGroup({
  field,
  state,
  values,
  onChange,
  onOpenSheet,
}: OptionChipGroupProps) {
  const handleSelect = (optionId: string) => {
    if (state.disabled) {
      return;
    }

    if (field.type === 'single-select' || field.type === 'sheet-select') {
      onChange([optionId]);
      return;
    }

    const nextValue = values.includes(optionId)
      ? values.filter((value) => value !== optionId)
      : [...values, optionId];

    onChange(nextValue);
  };

  return (
    <div className="chip-group-wrap">
      <div className="chip-group" role="group" aria-label={field.label}>
        {field.options.slice(0, field.type === 'sheet-select' ? 3 : field.options.length).map((option) => {
          const selected = values.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              className={`option-chip ${selected ? 'is-selected' : ''}`}
              onClick={() => handleSelect(option.id)}
              disabled={state.disabled}
              aria-pressed={selected}
            >
              <span>{option.label}</span>
              {option.badge ? <small>{option.badge}</small> : null}
            </button>
          );
        })}
      </div>

      {field.type === 'sheet-select' ? (
        <button type="button" className="sheet-trigger" onClick={onOpenSheet}>
          Browse all options
        </button>
      ) : null}
    </div>
  );
}
