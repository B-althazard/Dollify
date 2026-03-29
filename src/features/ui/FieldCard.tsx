import type { CreatorField } from '../schema/contracts';
import type { FieldRuleState } from '../rules/engine';

import { OptionChipGroup } from './OptionChipGroup';
import { RuleNotice } from './RuleNotice';

interface FieldCardProps {
  field: CreatorField;
  state: FieldRuleState;
  values: string[];
  onChange: (values: string[]) => void;
  onOpenSheet?: () => void;
}

export function FieldCard({ field, state, values, onChange, onOpenSheet }: FieldCardProps) {
  return (
    <article className="field-card card-surface">
      <div className="field-card__header">
        <div>
          <p className="section-label">{field.categoryId}</p>
          <h3>{field.label}</h3>
        </div>
        <div className="field-card__meta">
          {state.required ? <span className="field-badge">Required</span> : null}
          {state.maxSelections ? (
            <span className="field-badge">{state.selectedCount} of {state.maxSelections}</span>
          ) : null}
        </div>
      </div>

      <p className="field-description">{field.description}</p>
      {field.helperText ? <p className="field-helper">{field.helperText}</p> : null}

      <OptionChipGroup
        field={field}
        state={state}
        values={values}
        onChange={onChange}
        onOpenSheet={onOpenSheet}
      />

      {state.disabledReason ? <RuleNotice tone="danger">{state.disabledReason}</RuleNotice> : null}
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
