import type { FieldRuleState } from '../rules/engine';
import type { CreatorField } from '../schema/contracts';

import { OptionChipGroup } from './OptionChipGroup';
import { RuleNotice } from './RuleNotice';

interface FieldCardProps {
  field: CreatorField;
  state: FieldRuleState;
  values: string[];
  locked: boolean;
  expanded: boolean;
  onChange: (values: string[]) => void;
  onToggleOpen: () => void;
  onToggleLock: () => void;
  onOpenSheet?: () => void;
  onInspectOption?: (message: string) => void;
}

function LockIcon({ locked }: { locked: boolean }) {
  return locked ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 10V8a5 5 0 1 1 10 0v2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 10V8a5 5 0 0 1 9.4-2.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M15 10h1a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3h7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FieldCard({
  field,
  state,
  values,
  locked,
  expanded,
  onChange,
  onToggleOpen,
  onToggleLock,
  onOpenSheet,
  onInspectOption,
}: FieldCardProps) {
  return (
    <article className={`field-card card-surface ${expanded ? 'is-open' : ''}`}>
      <div className="field-card__header">
        <button
          type="button"
          className="field-card__toggle"
          onClick={onToggleOpen}
          aria-expanded={expanded}
        >
          <div>
            <p className="section-label">{field.categoryId}</p>
            <h3>{field.label}</h3>
          </div>
          <span className="field-card__chevron" aria-hidden="true">
            {expanded ? '−' : '+'}
          </span>
        </button>
        <div className="field-card__meta">
          <button
            type="button"
            className={`lock-button ${locked ? 'is-locked' : ''}`}
            onClick={(event) => {
              event.stopPropagation();
              onToggleLock();
            }}
            aria-pressed={locked}
            aria-label={
              locked ? `Unlock ${field.label}` : `Lock ${field.label}`
            }
          >
            <LockIcon locked={locked} />
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

      {expanded ? (
        <>
          <div className="field-card__copy">
            <p className="field-description">{field.description}</p>
            {field.helperText ? (
              <p className="field-helper">{field.helperText}</p>
            ) : null}
          </div>

          <OptionChipGroup
            field={field}
            state={state}
            values={values}
            locked={locked}
            onChange={onChange}
            onOpenSheet={onOpenSheet}
            onInspectOption={onInspectOption}
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
        </>
      ) : null}
    </article>
  );
}
