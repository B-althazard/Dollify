import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getDefaultPromptConfig } from '../prompt/catalog';
import { randomizeCreatorSnapshot } from '../randomize/engine';
import {
  type EvaluatedCreatorState,
  evaluateCreatorState,
} from '../rules/engine';
import type { CreatorSnapshot } from '../schema/contracts';
import { getCreatorSchema, getSchemaCategoryIds } from '../schema/registry';

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
    fieldLocks: {},
    promptConfig: getDefaultPromptConfig(),
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
  toggleFieldLock: (fieldId: string) => void;
  setPromptConfig: (value: Partial<CreatorSnapshot['promptConfig']>) => void;
  openDetailSheet: (fieldId: string | null) => void;
  randomizeCreator: (rng?: () => number) => void;
  resetCreator: () => void;
}

const defaultSnapshot = buildDefaultSnapshot();
const defaultDerived = buildEvaluatedState(defaultSnapshot);

export const useCreatorStore = create<CreatorStoreState>()(
  persist(
    (set) => ({
      ...defaultSnapshot,
      ...defaultDerived,
      detailSheetFieldId: null,
      derived: defaultDerived,
      setMode: (mode) =>
        set((state) => {
          const nextSnapshot = {
            version: state.version,
            mode,
            activeCategoryId: state.activeCategoryId,
            formValues: { ...state.formValues, 'identity.mode': [mode] },
            fieldLocks: state.fieldLocks,
            promptConfig: state.promptConfig,
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
            fieldLocks: state.fieldLocks,
            promptConfig: state.promptConfig,
          };
          const derived = buildEvaluatedState(nextSnapshot);

          return { ...nextSnapshot, ...derived, derived };
        }),
      toggleFieldLock: (fieldId) =>
        set((state) => ({
          fieldLocks: {
            ...state.fieldLocks,
            [fieldId]: !state.fieldLocks[fieldId],
          },
        })),
      setPromptConfig: (value) =>
        set((state) => ({
          promptConfig: {
            ...state.promptConfig,
            ...value,
            styleIds: value.styleIds ?? state.promptConfig.styleIds,
          },
        })),
      openDetailSheet: (detailSheetFieldId) => set({ detailSheetFieldId }),
      randomizeCreator: (rng) =>
        set((state) => {
          const nextSnapshot = {
            version: state.version,
            mode: state.mode,
            activeCategoryId: state.activeCategoryId,
            formValues: state.formValues,
            fieldLocks: state.fieldLocks,
            promptConfig: state.promptConfig,
          };
          const randomized = randomizeCreatorSnapshot(
            schema,
            nextSnapshot,
            state.derived,
            { rng },
          );

          return {
            ...randomized.snapshot,
            ...randomized.derived,
            derived: randomized.derived,
          };
        }),
      resetCreator: () =>
        set({
          ...defaultSnapshot,
          ...defaultDerived,
          derived: defaultDerived,
          detailSheetFieldId: null,
        }),
    }),
    {
      name: 'dollify-creator-v1',
      merge: (persistedState, currentState) => {
        const nextSnapshot = {
          version: currentState.version,
          mode:
            (persistedState as Partial<CreatorSnapshot> | undefined)?.mode ??
            currentState.mode,
          activeCategoryId:
            (persistedState as Partial<CreatorSnapshot> | undefined)
              ?.activeCategoryId ?? currentState.activeCategoryId,
          formValues:
            (persistedState as Partial<CreatorSnapshot> | undefined)
              ?.formValues ?? currentState.formValues,
          fieldLocks:
            (persistedState as Partial<CreatorSnapshot> | undefined)
              ?.fieldLocks ?? currentState.fieldLocks,
          promptConfig: {
            ...currentState.promptConfig,
            ...((persistedState as Partial<CreatorSnapshot> | undefined)
              ?.promptConfig ?? {}),
          },
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
        fieldLocks: state.fieldLocks,
        promptConfig: state.promptConfig,
      }),
    },
  ),
);

export function getDefaultSnapshot() {
  return defaultSnapshot;
}
