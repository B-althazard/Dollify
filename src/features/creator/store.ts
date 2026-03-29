import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  };
}

export interface CreatorStoreState extends CreatorSnapshot {
  detailSheetFieldId: string | null;
  setMode: (mode: CreatorSnapshot['mode']) => void;
  setActiveCategory: (categoryId: string) => void;
  setFieldValue: (fieldId: string, value: string[]) => void;
  openDetailSheet: (fieldId: string | null) => void;
  resetCreator: () => void;
}

const defaultSnapshot = buildDefaultSnapshot();

export const useCreatorStore = create<CreatorStoreState>()(
  persist(
    (set) => ({
      ...defaultSnapshot,
      detailSheetFieldId: null,
      setMode: (mode) => set({ mode, formValues: { ...defaultSnapshot.formValues, 'identity.mode': [mode] } }),
      setActiveCategory: (activeCategoryId) => set({ activeCategoryId }),
      setFieldValue: (fieldId, value) =>
        set((state) => ({
          formValues: { ...state.formValues, [fieldId]: value },
        })),
      openDetailSheet: (detailSheetFieldId) => set({ detailSheetFieldId }),
      resetCreator: () => set({ ...defaultSnapshot, detailSheetFieldId: null }),
    }),
    {
      name: 'dollify-creator-v1',
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
