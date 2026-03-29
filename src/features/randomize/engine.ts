import {
  type EvaluatedCreatorState,
  evaluateCreatorState,
} from '../rules/engine';
import type {
  CreatorSchemaDocument,
  CreatorSnapshot,
} from '../schema/contracts';

export interface RandomizeOptions {
  rng?: () => number;
}

function pickOne<T>(items: T[], rng: () => number) {
  return items[Math.floor(rng() * items.length)] ?? items[0];
}

function pickCount(max: number, required: boolean, rng: () => number) {
  if (max <= 1) {
    return 1;
  }

  const min = required ? 1 : 0;
  return Math.max(1, Math.floor(rng() * (max - min + 1)) + min);
}

export function randomizeCreatorSnapshot(
  schema: CreatorSchemaDocument,
  snapshot: CreatorSnapshot,
  evaluatedState: EvaluatedCreatorState,
  options: RandomizeOptions = {},
) {
  const rng = options.rng ?? Math.random;
  const nextSnapshot: CreatorSnapshot = {
    ...snapshot,
    formValues: { ...snapshot.formValues },
    fieldLocks: { ...snapshot.fieldLocks },
    promptConfig: {
      ...snapshot.promptConfig,
      styleIds: [...snapshot.promptConfig.styleIds],
    },
  };
  let nextDerived = evaluatedState;

  for (const field of schema.fields) {
    const fieldState = nextDerived.fieldStates[field.id];

    if (
      !fieldState?.visible ||
      fieldState.disabled ||
      nextSnapshot.fieldLocks[field.id]
    ) {
      continue;
    }

    const optionIds = field.options.map((option) => option.id);

    if (field.type === 'single-select' || field.type === 'sheet-select') {
      nextSnapshot.formValues[field.id] = [pickOne(optionIds, rng)];
    } else {
      const selected = new Set<string>();
      const count = pickCount(
        field.maxSelections ?? optionIds.length,
        fieldState.required,
        rng,
      );

      while (selected.size < count && selected.size < optionIds.length) {
        selected.add(pickOne(optionIds, rng));
      }

      nextSnapshot.formValues[field.id] = [...selected];
    }

    nextDerived = evaluateCreatorState(schema, nextSnapshot);
  }

  return {
    snapshot: nextSnapshot,
    derived: nextDerived,
  };
}
