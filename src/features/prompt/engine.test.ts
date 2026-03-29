import { evaluateCreatorState } from '../rules/engine';
import { getCreatorSchema } from '../schema/registry';
import { buildPromptPackage } from './engine';

const schema = getCreatorSchema();

describe('prompt engine', () => {
  it('builds a deterministic prompt package from schema-backed values', () => {
    const evaluated = evaluateCreatorState(schema, {
      mode: 'female',
      formValues: {
        'identity.mode': ['female'],
        'identity.persona': ['luxury-babe'],
        'physique.frame': ['hourglass'],
        'physique.features': ['long-legs', 'full-bust'],
        'physique.appendage': [],
        'face.expression': ['smoldering'],
        'face.finish': ['soft-glam'],
        'style.outfit': ['lingerie-set'],
        'style.scene': ['vanity-suite'],
      },
    });

    const promptPackage = buildPromptPackage(schema, evaluated, {
      modelId: 'editorial-gloss',
      aspectRatio: '4:5',
      styleIds: ['editorial-polish'],
    });

    expect(promptPackage.positivePrompt).toContain('luxury babe glamour');
    expect(promptPackage.positivePrompt).toContain('hourglass silhouette');
    expect(promptPackage.positivePrompt).toContain('editorial lighting');
    expect(promptPackage.negativePrompt).toContain('muddy lighting');
    expect(promptPackage.summaryLines).toContain('Outfit story: Lingerie set');
    expect(promptPackage.guidanceLines).toContain('Target aspect ratio 4:5.');
  });
});
