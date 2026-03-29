import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { CreatorSnapshot } from '../schema/contracts';
import { getCreatorSchema, getSchemaCategoryIds } from '../schema/registry';
import { evaluateCreatorState, type EvaluatedCreatorState } from '../rules/engine';

const schema = getCreatorSchema();

function buildDefaultSnapshot(): CreatorSnapshot {
  const formValues = Object.fromEntries(
    schema.fields.map((field) => [field.id, [...field.defaultValue]]),
  );

  return {
    version: schema.version,
    mode: 'female',
    activeCategoryId: getSchemaCategoryIds()[0],
    formValues,
  };
}

function buildEvaluatedState(snapshot: CreatorSnapshot): EvaluatedCreatorState {
  return evaluateCreatorState(schema, snapshot);
}

export interface CreatorStoreState extends CreatorSnapshot {
  detailSheetFieldId: string | null;
  derived: EvaluatedCreatorState;
  setMode: (mode: CreatorSnapshot['mode']) => void;
  setActiveCategory: (categoryId: string) => void;
  setFieldValue: (fieldId: string, value: string[]) => void;
  openDetailSheet: (fieldId: string | null) => void;
  resetCreator: () => void;
}

const defaultSnapshot = buildDefaultSnapshot();
const defaultDerived = buildEvaluatedState(defaultSnapshot);

export const useCreatorStore = create<CreatorStoreState>()(
  persist(
    (set) => ({
      ...defaultDerived,
      version: defaultSnapshot.version,
      activeCategoryId: defaultSnapshot.activeCategoryId,
      detailSheetFieldId: null,
      derived: defaultDerived,
      setMode: (mode) =>
        set((state) => {
          const nextSnapshot = {
            version: state.version,
            mode,
            activeCategoryId: state.activeCategoryId,
            formValues: { ...state.formValues, 'identity.mode': [mode] },
          };
          const derived = buildEvaluatedState(nextSnapshot);

          return { ...nextSnapshot, ...derived, derived };
        }),
      setActiveCategory: (activeCategoryId) => set({ activeCategoryId }),
      setFieldValue: (fieldId, value) =>
        set((state) => {
          const nextSnapshot = {
            version: state.version,
            mode: state.mode,
            activeCategoryId: state.activeCategoryId,
            formValues: { ...state.formValues, [fieldId]: value },
          };
          const derived = buildEvaluatedState(nextSnapshot);

          return { ...nextSnapshot, ...derived, derived };
        }),
      openDetailSheet: (detailSheetFieldId) => set({ detailSheetFieldId }),
      resetCreator: () => set({ ...defaultSnapshot, ...defaultDerived, derived: defaultDerived, detailSheetFieldId: null }),
    }),
    {
      name: 'dollify-creator-v1',
      merge: (persistedState, currentState) => {
        const nextSnapshot = {
          version: currentState.version,
          mode:
            (persistedState as Partial<CreatorSnapshot> | undefined)?.mode ?? currentState.mode,
          activeCategoryId:
            (persistedState as Partial<CreatorSnapshot> | undefined)?.activeCategoryId ??
            currentState.activeCategoryId,
          formValues:
            (persistedState as Partial<CreatorSnapshot> | undefined)?.formValues ??
            currentState.formValues,
        };
        const derived = buildEvaluatedState(nextSnapshot);

        return {
          ...currentState,
          ...nextSnapshot,
          ...derived,
          derived,
        };
      },
      partialize: (state) => ({
        version: state.version,
        mode: state.mode,
        activeCategoryId: state.activeCategoryId,
        formValues: state.formValues,
      }),
    },
  ),
);

export function getDefaultSnapshot() {
  return defaultSnapshot;
}
