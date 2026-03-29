import type { PromptConfig } from '../schema/contracts';

export interface PromptStyleOption {
  id: string;
  label: string;
  note: string;
}

export interface PromptModelProfile {
  id: string;
  label: string;
  note: string;
  supportedStyleIds: string[];
  positiveBoosts: string[];
  negativeBoosts: string[];
  guidance: string[];
}

export const promptStyleOptions: PromptStyleOption[] = [
  {
    id: 'editorial-polish',
    label: 'Editorial polish',
    note: 'Sharper beauty retouch and proof-sheet control.',
  },
  {
    id: 'soft-film',
    label: 'Soft film glow',
    note: 'Adds warmer bloom and a slightly analog finish.',
  },
  {
    id: 'night-luxe',
    label: 'Night luxe',
    note: 'Pushes richer contrast for club and vanity scenes.',
  },
];

export const promptModelProfiles: PromptModelProfile[] = [
  {
    id: 'velvet-realism',
    label: 'Velvet Realism',
    note: 'Beauty-first realism with dependable anatomy and skin texture.',
    supportedStyleIds: ['editorial-polish', 'soft-film'],
    positiveBoosts: ['high-detail beauty photography', 'natural skin texture'],
    negativeBoosts: ['plastic skin', 'warped anatomy'],
    guidance: [
      'Best for portrait-led prompt builds with restrained stylization.',
      'Keep camera language simple when anatomy fidelity matters most.',
    ],
  },
  {
    id: 'editorial-gloss',
    label: 'Editorial Gloss',
    note: 'Sharper styling, stronger posing, and cleaner fashion-forward reads.',
    supportedStyleIds: ['editorial-polish', 'night-luxe'],
    positiveBoosts: ['editorial lighting', 'luxury styling cues'],
    negativeBoosts: ['muddy lighting', 'flat wardrobe detail'],
    guidance: [
      'Works best when outfit and scene selections are both strong.',
      'Use editorial polish for cleaner proof-sheet style outputs.',
    ],
  },
  {
    id: 'after-hours',
    label: 'After Hours',
    note: 'Higher-contrast nightlife bias with strong mood and sheen.',
    supportedStyleIds: ['soft-film', 'night-luxe'],
    positiveBoosts: ['cinematic contrast', 'atmospheric highlights'],
    negativeBoosts: ['washed out shadows', 'dull nightclub ambience'],
    guidance: [
      'Pairs especially well with darker scenes and bolder persona directions.',
      'Night luxe works best when you want club or lounge energy to read fast.',
    ],
  },
];

export const aspectRatioOptions = [
  { id: '4:5', label: '4:5', note: 'Portrait default' },
  { id: '3:4', label: '3:4', note: 'Balanced portrait' },
  { id: '9:16', label: '9:16', note: 'Story-friendly vertical' },
] as const;

export function getDefaultPromptConfig(): PromptConfig {
  return {
    modelId: promptModelProfiles[0].id,
    aspectRatio: aspectRatioOptions[0].id,
    styleIds: ['editorial-polish'],
  };
}

export function getPromptModelProfile(modelId: string) {
  return promptModelProfiles.find((profile) => profile.id === modelId);
}

export function getSupportedStyleIds(config: PromptConfig) {
  return new Set(
    getPromptModelProfile(config.modelId)?.supportedStyleIds ?? [],
  );
}
