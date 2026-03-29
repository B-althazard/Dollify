import type {
  CreatorCondition,
  CreatorField,
  CreatorMode,
  CreatorSchemaDocument,
} from '../schema/contracts';

export interface FieldRuleState {
  visible: boolean;
  disabled: boolean;
  disabledReason?: string;
  required: boolean;
  selectedCount: number;
  maxSelections?: number;
  issues: string[];
}

export interface EvaluatedCreatorState {
  mode: CreatorMode;
  formValues: Record<string, string[]>;
  fieldStates: Record<string, FieldRuleState>;
  categoryStates: Record<
    string,
    {
      status: 'complete' | 'incomplete' | 'conflict';
      visibleFieldIds: string[];
    }
  >;
  notices: string[];
  isValid: boolean;
}

function getFieldValues(formValues: Record<string, string[]>, fieldId: string): string[] {
  return formValues[fieldId] ?? [];
}

function matchesCondition(
  condition: CreatorCondition | undefined,
  formValues: Record<string, string[]>,
  mode: CreatorMode,
): boolean {
  if (!condition) {
    return true;
  }

  if (condition.modeIs && condition.modeIs !== mode) {
    return false;
  }

  const values = getFieldValues(formValues, condition.fieldId);

  if (condition.equals) {
    const targets = Array.isArray(condition.equals) ? condition.equals : [condition.equals];
    return targets.some((target) => values.includes(target));
  }

  if (condition.includes) {
    return values.includes(condition.includes);
  }

  return true;
}

function normalizeFieldValue(field: CreatorField, values: string[]): string[] {
  const allowedIds = new Set(field.options.map((option) => option.id));
  const filtered = values.filter((value) => allowedIds.has(value));
  const uniqueValues = [...new Set(filtered)];

  if (field.type === 'single-select' || field.type === 'sheet-select') {
    return uniqueValues.slice(0, 1);
  }

  if (field.maxSelections) {
    return uniqueValues.slice(0, field.maxSelections);
  }

  return uniqueValues;
}

export function evaluateCreatorState(
  schema: CreatorSchemaDocument,
  input: {
    mode: CreatorMode;
    formValues: Record<string, string[]>;
  },
): EvaluatedCreatorState {
  const notices: string[] = [];
  const normalizedValues: Record<string, string[]> = {};

  for (const field of schema.fields) {
    const incomingValue = getFieldValues(input.formValues, field.id);
    normalizedValues[field.id] = normalizeFieldValue(field, incomingValue);
  }

  const modeValue = normalizedValues['identity.mode']?.[0];
  const mode = modeValue === 'futa' ? 'futa' : 'female';
  normalizedValues['identity.mode'] = [mode];

  const fieldStates = Object.fromEntries(
    schema.fields.map((field) => {
      const visible = matchesCondition(field.visibleWhen, normalizedValues, mode);
      const disabled = field.disableWhen
        ? matchesCondition(field.disableWhen.condition, normalizedValues, mode)
        : false;
      const required = field.required || matchesCondition(field.requiredWhen, normalizedValues, mode);
      const selectedCount = normalizedValues[field.id]?.length ?? 0;
      const issues: string[] = [];

      if (!visible) {
        if (selectedCount > 0) {
          normalizedValues[field.id] = [];
          notices.push(`${field.label} was cleared because it is not available in this mode.`);
        }
      }

      if (disabled) {
        if (selectedCount > 0) {
          normalizedValues[field.id] = [];
          notices.push(`${field.label} was cleared because its current persona blocks it.`);
        }
        issues.push(field.disableWhen?.reason ?? 'This field is unavailable right now.');
      }

      if (required && normalizedValues[field.id].length === 0) {
        issues.push('Required selection missing.');
      }

      if (field.maxSelections && normalizedValues[field.id].length > field.maxSelections) {
        normalizedValues[field.id] = normalizedValues[field.id].slice(0, field.maxSelections);
        notices.push(`${field.label} was trimmed to ${field.maxSelections} selections.`);
      }

      return [
        field.id,
        {
          visible,
          disabled,
          disabledReason: disabled ? field.disableWhen?.reason : undefined,
          required,
          selectedCount: normalizedValues[field.id].length,
          maxSelections: field.maxSelections,
          issues,
        },
      ];
    }),
  ) as Record<string, FieldRuleState>;

  const categoryStates = Object.fromEntries(
    schema.categories.map((category) => {
      const categoryFields = schema.fields.filter((field) => field.categoryId === category.id);
      const visibleFieldIds = categoryFields
        .filter((field) => fieldStates[field.id].visible)
        .map((field) => field.id);
      const hasConflict = categoryFields.some((field) => fieldStates[field.id].issues.length > 0);
      const allRequiredSatisfied = categoryFields
        .filter((field) => fieldStates[field.id].visible && fieldStates[field.id].required)
        .every((field) => normalizedValues[field.id].length > 0);

      return [
        category.id,
        {
          status: hasConflict ? 'conflict' : allRequiredSatisfied ? 'complete' : 'incomplete',
          visibleFieldIds,
        },
      ];
    }),
  ) as EvaluatedCreatorState['categoryStates'];

  return {
    mode,
    formValues: normalizedValues,
    fieldStates,
    categoryStates,
    notices,
    isValid: Object.values(fieldStates).every((state) => state.issues.length === 0),
  };
}

export function getVisibleFieldsForCategory(
  schema: CreatorSchemaDocument,
  evaluatedState: EvaluatedCreatorState,
  categoryId: string,
) {
  return schema.fields.filter(
    (field) => field.categoryId === categoryId && evaluatedState.fieldStates[field.id]?.visible,
  );
}
