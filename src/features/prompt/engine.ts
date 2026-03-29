import type { EvaluatedCreatorState } from '../rules/engine';
import type {
  CreatorField,
  CreatorSchemaDocument,
  PromptConfig,
} from '../schema/contracts';
import {
  getPromptModelProfile,
  getSupportedStyleIds,
  promptStyleOptions,
} from './catalog';

export interface PromptPackage {
  signature: string;
  positivePrompt: string;
  negativePrompt: string;
  summaryLines: string[];
  warnings: string[];
  modelHints: string[];
  guidanceLines: string[];
}

function getSelectedPromptTokens(field: CreatorField, values: string[]) {
  return values
    .map((value) => field.options.find((option) => option.id === value))
    .filter((option): option is NonNullable<typeof option> => Boolean(option))
    .map((option) => option.promptToken ?? option.label.toLowerCase())
    .filter(Boolean);
}

function getSummaryLine(field: CreatorField, values: string[]) {
  const labels = values
    .map((value) => field.options.find((option) => option.id === value))
    .filter((option): option is NonNullable<typeof option> => Boolean(option))
    .map((option) => option.summaryLabel ?? option.label);

  if (labels.length === 0) {
    return null;
  }

  return `${field.label}: ${labels.join(', ')}`;
}

export function buildPromptSignature(
  evaluatedState: EvaluatedCreatorState,
  config: PromptConfig,
) {
  return JSON.stringify({
    mode: evaluatedState.mode,
    formValues: evaluatedState.formValues,
    promptConfig: config,
  });
}

export function buildPromptPackage(
  schema: CreatorSchemaDocument,
  evaluatedState: EvaluatedCreatorState,
  config: PromptConfig,
): PromptPackage {
  const modelProfile = getPromptModelProfile(config.modelId);
  const supportedStyleIds = getSupportedStyleIds(config);
  const activeStyleLabels = promptStyleOptions
    .filter(
      (style) =>
        config.styleIds.includes(style.id) && supportedStyleIds.has(style.id),
    )
    .map((style) => style.label.toLowerCase());
  const promptTokens = schema.fields.flatMap((field) => {
    const fieldState = evaluatedState.fieldStates[field.id];

    if (!fieldState?.visible || fieldState.disabled) {
      return [];
    }

    return getSelectedPromptTokens(
      field,
      evaluatedState.formValues[field.id] ?? [],
    );
  });
  const summaryLines = schema.fields
    .map((field) => {
      const fieldState = evaluatedState.fieldStates[field.id];

      if (!fieldState?.visible) {
        return null;
      }

      return getSummaryLine(field, evaluatedState.formValues[field.id] ?? []);
    })
    .filter((line): line is string => Boolean(line));
  const warnings = [
    ...(evaluatedState.isValid
      ? []
      : ['Creator state is incomplete. Prompt quality may be weak.']),
    ...(config.styleIds.length === 0
      ? [
          'No optional style finish selected. Output may feel less art-directed.',
        ]
      : []),
  ];

  if (evaluatedState.mode === 'futa') {
    promptTokens.push('futa-female anatomy, coherent appendage styling');
  } else {
    promptTokens.push('female anatomy, cohesive beauty proportions');
  }

  if (modelProfile) {
    promptTokens.push(...modelProfile.positiveBoosts);
  }

  if (activeStyleLabels.length > 0) {
    promptTokens.push(...activeStyleLabels);
  }

  promptTokens.push(`portrait composition, aspect ratio ${config.aspectRatio}`);

  const negativeTokens = [
    'lowres',
    'extra limbs',
    'duplicate body parts',
    'bad hands',
    'text watermark',
    ...(modelProfile?.negativeBoosts ?? []),
  ];

  return {
    signature: buildPromptSignature(evaluatedState, config),
    positivePrompt: [...new Set(promptTokens)].join(', '),
    negativePrompt: [...new Set(negativeTokens)].join(', '),
    summaryLines,
    warnings,
    modelHints: modelProfile
      ? [`${modelProfile.label}: ${modelProfile.note}`]
      : ['Select a model profile to tune the package.'],
    guidanceLines: [
      `Target aspect ratio ${config.aspectRatio}.`,
      ...(modelProfile?.guidance ?? []),
      ...(activeStyleLabels.length > 0
        ? [`Style finish: ${activeStyleLabels.join(', ')}.`]
        : []),
    ],
  };
}
