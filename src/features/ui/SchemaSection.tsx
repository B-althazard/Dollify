import { motion } from 'motion/react';
import type { EvaluatedCreatorState } from '../rules/engine';
import type { CreatorCategory, CreatorField } from '../schema/contracts';

import { FieldCard } from './FieldCard';
import { RuleNotice } from './RuleNotice';

interface SchemaSectionProps {
  category: CreatorCategory;
  fields: CreatorField[];
  derived: EvaluatedCreatorState;
  fieldLocks: Record<string, boolean>;
  formValues: Record<string, string[]>;
  onChangeField: (fieldId: string, values: string[]) => void;
  onToggleFieldLock: (fieldId: string) => void;
  onOpenSheet: (fieldId: string) => void;
  reducedMotion: boolean;
  swipeHandlers: {
    onTouchStart: (event: React.TouchEvent<HTMLElement>) => void;
    onTouchEnd: (event: React.TouchEvent<HTMLElement>) => void;
  };
}

export function SchemaSection({
  category,
  fields,
  derived,
  fieldLocks,
  formValues,
  onChangeField,
  onToggleFieldLock,
  onOpenSheet,
  reducedMotion,
  swipeHandlers,
}: SchemaSectionProps) {
  const categoryState = derived.categoryStates[category.id];

  return (
    <motion.section
      className="schema-section"
      data-testid="swipe-surface"
      initial={reducedMotion ? false : { opacity: 0.5, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reducedMotion ? { duration: 0 } : { duration: 0.24, ease: 'easeOut' }
      }
      {...swipeHandlers}
    >
      <header className="category-hero card-surface">
        <div>
          <p className="section-label">{categoryState.status}</p>
          <h2>{category.label}</h2>
        </div>
        <p>{category.description}</p>
      </header>

      {fields.length === 0 ? (
        <div className="card-surface">
          <RuleNotice>{category.emptyState}</RuleNotice>
        </div>
      ) : null}

      {fields.map((field) => (
        <FieldCard
          key={field.id}
          field={field}
          state={derived.fieldStates[field.id]}
          values={formValues[field.id] ?? []}
          locked={Boolean(fieldLocks[field.id])}
          onChange={(values) => onChangeField(field.id, values)}
          onToggleLock={() => onToggleFieldLock(field.id)}
          onOpenSheet={
            field.type === 'sheet-select'
              ? () => onOpenSheet(field.id)
              : undefined
          }
        />
      ))}
    </motion.section>
  );
}
