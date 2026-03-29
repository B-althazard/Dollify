import { z } from 'zod';

export const creatorModeSchema = z.enum(['female', 'futa']);

const conditionSchema = z.object({
  fieldId: z.string(),
  equals: z.union([z.string(), z.array(z.string())]).optional(),
  includes: z.string().optional(),
  modeIs: creatorModeSchema.optional(),
});

const optionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  tone: z.enum(['default', 'accent', 'warm']).optional(),
  badge: z.string().optional(),
});

const fieldSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  label: z.string(),
  description: z.string().optional(),
  helperText: z.string().optional(),
  type: z.enum(['single-select', 'multi-select', 'sheet-select']),
  defaultValue: z.array(z.string()),
  required: z.boolean().default(false),
  requiredWhen: conditionSchema.optional(),
  maxSelections: z.number().int().positive().optional(),
  visibleWhen: conditionSchema.optional(),
  disableWhen: z.object({
    condition: conditionSchema,
    reason: z.string(),
  }).optional(),
  options: z.array(optionSchema).min(1),
});

const categorySchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  emptyState: z.string(),
});

export const creatorSchemaDocument = z.object({
  version: z.string(),
  title: z.string(),
  modes: z.array(creatorModeSchema).min(1),
  categories: z.array(categorySchema).min(1),
  fields: z.array(fieldSchema).min(1),
});

export const creatorSnapshotSchema = z.object({
  version: z.string(),
  mode: creatorModeSchema,
  activeCategoryId: z.string(),
  formValues: z.record(z.string(), z.array(z.string())),
});

export type CreatorMode = z.infer<typeof creatorModeSchema>;
export type CreatorSchemaDocument = z.infer<typeof creatorSchemaDocument>;
export type CreatorCategory = CreatorSchemaDocument['categories'][number];
export type CreatorField = CreatorSchemaDocument['fields'][number];
export type CreatorCondition = z.infer<typeof conditionSchema>;
export type CreatorOption = z.infer<typeof optionSchema>;
export type CreatorSnapshot = z.infer<typeof creatorSnapshotSchema>;
