import { useRef } from 'react';
import type { FieldRuleState } from '../rules/engine';
import type { CreatorField } from '../schema/contracts';

interface OptionChipGroupProps {
  field: CreatorField;
  state: FieldRuleState;
  values: string[];
  locked: boolean;
  onChange: (values: string[]) => void;
  onOpenSheet?: () => void;
  onInspectOption?: (message: string) => void;
}

function buildOptionPreview(seed: string, label: string) {
  const hash = Array.from(seed).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  const hueA = hash % 360;
  const hueB = (hash * 1.7) % 360;
  const radius = 18 + (hash % 18);
  const points = 4 + (hash % 3);
  const polygon = Array.from({ length: points }, (_, index) => {
    const angle = (Math.PI * 2 * index) / points - Math.PI / 2;
    const pointRadius = 18 + ((hash + index * 11) % 12);
    const x = 32 + Math.cos(angle) * pointRadius;
    const y = 32 + Math.sin(angle) * pointRadius;

    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="20" fill="hsl(${hueA} 72% 92%)"/><circle cx="32" cy="32" r="${radius}" fill="hsl(${hueB} 54% 74%)" opacity="0.9"/><polygon points="${polygon}" fill="white" opacity="0.74"/><text x="32" y="57" text-anchor="middle" font-size="8" font-family="Arial, sans-serif" fill="rgba(22,16,20,0.72)">${label.slice(0, 8)}</text></svg>`;

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export function OptionChipGroup({
  field,
  state,
  values,
  locked,
  onChange,
  onOpenSheet,
  onInspectOption,
}: OptionChipGroupProps) {
  const longPressTimerRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);

  const handleSelect = (optionId: string) => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

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

  const clearLongPress = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const startLongPress = (message: string) => {
    clearLongPress();
    longPressTriggeredRef.current = false;
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true;
      onInspectOption?.(message);
    }, 420);
  };

  const visualOptions = field.type !== 'multi-select';

  return (
    <div className="chip-group-wrap">
      <fieldset
        className={`chip-group ${visualOptions ? 'is-visual-grid' : ''}`}
      >
        <legend className="sr-only">{field.label}</legend>
        {field.options
          .slice(0, field.type === 'sheet-select' ? 3 : field.options.length)
          .map((option) => {
            const selected = values.includes(option.id);
            const inspectionMessage =
              option.description ??
              field.helperText ??
              field.description ??
              `${option.label} selected for ${field.label}.`;

            return (
              <button
                key={option.id}
                type="button"
                className={`option-chip ${selected ? 'is-selected' : ''} ${visualOptions ? 'is-visual' : ''}`}
                onClick={() => handleSelect(option.id)}
                disabled={state.disabled || locked}
                aria-pressed={selected}
                onPointerDown={() => startLongPress(inspectionMessage)}
                onPointerUp={clearLongPress}
                onPointerLeave={clearLongPress}
                onPointerCancel={clearLongPress}
                onContextMenu={(event) => {
                  event.preventDefault();
                  clearLongPress();
                  onInspectOption?.(inspectionMessage);
                }}
                title={inspectionMessage}
              >
                {visualOptions ? (
                  <span
                    className="option-chip__visual"
                    aria-hidden="true"
                    style={{
                      backgroundImage: buildOptionPreview(
                        option.id,
                        option.label,
                      ),
                    }}
                  />
                ) : null}
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
