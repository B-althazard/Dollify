import type { FieldRuleState } from '../rules/engine';
import type { CreatorField } from '../schema/contracts';

interface OptionChipGroupProps {
  field: CreatorField;
  state: FieldRuleState;
  values: string[];
  locked: boolean;
  onChange: (values: string[]) => void;
  onOpenSheet?: () => void;
}

export function OptionChipGroup({
  field,
  state,
  values,
  locked,
  onChange,
  onOpenSheet,
}: OptionChipGroupProps) {
  const handleSelect = (optionId: string) => {
    if (state.disabled || locked) {
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
      <fieldset className="chip-group">
        <legend className="sr-only">{field.label}</legend>
        {field.options
          .slice(0, field.type === 'sheet-select' ? 3 : field.options.length)
          .map((option) => {
            const selected = values.includes(option.id);

            return (
              <button
                key={option.id}
                type="button"
                className={`option-chip ${selected ? 'is-selected' : ''}`}
                onClick={() => handleSelect(option.id)}
                disabled={state.disabled || locked}
                aria-pressed={selected}
              >
                <span>{option.label}</span>
                {option.badge ? <small>{option.badge}</small> : null}
              </button>
            );
          })}
      </fieldset>

      {field.type === 'sheet-select' ? (
        <button
          type="button"
          className="sheet-trigger"
          onClick={onOpenSheet}
          disabled={state.disabled || locked}
        >
          Browse all options
        </button>
      ) : null}
    </div>
  );
}
