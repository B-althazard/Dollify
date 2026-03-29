import { getDefaultPromptConfig } from '../prompt/catalog';
import { evaluateCreatorState } from '../rules/engine';
import { getCreatorSchema } from '../schema/registry';
import { randomizeCreatorSnapshot } from './engine';

const schema = getCreatorSchema();

describe('randomize engine', () => {
  it('keeps locked fields stable while randomizing eligible fields', () => {
    const snapshot = {
      version: schema.version,
      mode: 'female' as const,
      activeCategoryId: 'identity',
      formValues: {
        'identity.mode': ['female'],
        'identity.persona': ['editorial-muse'],
        'physique.frame': ['hourglass'],
        'physique.features': ['soft-waist'],
        'physique.appendage': [],
        'face.expression': ['inviting'],
        'face.finish': ['soft-glam'],
        'style.outfit': ['silk-robe'],
        'style.scene': ['vanity-suite'],
      },
      fieldLocks: {
        'physique.frame': true,
      },
      promptConfig: getDefaultPromptConfig(),
    };
    const evaluated = evaluateCreatorState(schema, snapshot);
    const sequence = [0.9, 0.2, 0.8, 0.4, 0.1, 0.7, 0.6, 0.3];
    let index = 0;

    const result = randomizeCreatorSnapshot(schema, snapshot, evaluated, {
      rng: () => sequence[index++] ?? 0.5,
    });

    expect(result.snapshot.formValues['physique.frame']).toEqual(['hourglass']);
    expect(result.snapshot.formValues['style.outfit']).not.toEqual([
      'silk-robe',
    ]);
    expect(result.snapshot.formValues['physique.appendage']).toEqual([]);
    expect(result.derived.isValid).toBe(true);
  });
});
