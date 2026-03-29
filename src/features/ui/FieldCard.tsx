import type { FieldRuleState } from '../rules/engine';
import type { CreatorField } from '../schema/contracts';

import { OptionChipGroup } from './OptionChipGroup';
import { RuleNotice } from './RuleNotice';

interface FieldCardProps {
  field: CreatorField;
  state: FieldRuleState;
  values: string[];
  locked: boolean;
  onChange: (values: string[]) => void;
  onToggleLock: () => void;
  onOpenSheet?: () => void;
}

export function FieldCard({
  field,
  state,
  values,
  locked,
  onChange,
  onToggleLock,
  onOpenSheet,
}: FieldCardProps) {
  return (
    <article className="field-card card-surface">
      <div className="field-card__header">
        <div>
          <p className="section-label">{field.categoryId}</p>
          <h3>{field.label}</h3>
        </div>
        <div className="field-card__meta">
          <button
            type="button"
            className={`lock-button ${locked ? 'is-locked' : ''}`}
            onClick={onToggleLock}
            aria-pressed={locked}
          >
            {locked ? 'Locked' : 'Unlocked'}
          </button>
          {state.required ? (
            <span className="field-badge">Required</span>
          ) : null}
          {state.maxSelections ? (
            <span className="field-badge">
              {state.selectedCount} of {state.maxSelections}
            </span>
          ) : null}
        </div>
      </div>

      <p className="field-description">{field.description}</p>
      {field.helperText ? (
        <p className="field-helper">{field.helperText}</p>
      ) : null}

      <OptionChipGroup
        field={field}
        state={state}
        values={values}
        locked={locked}
        onChange={onChange}
        onOpenSheet={onOpenSheet}
      />

      {state.disabledReason ? (
        <RuleNotice tone="danger">{state.disabledReason}</RuleNotice>
      ) : null}
      {state.issues
        .filter((issue) => issue !== state.disabledReason)
        .map((issue) => (
          <RuleNotice key={issue} tone="neutral">
            {issue}
          </RuleNotice>
        ))}
    </article>
  );
}
