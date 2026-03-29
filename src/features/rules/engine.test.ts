import { getCreatorSchema } from '../schema/registry';
import { evaluateCreatorState } from './engine';

const schema = getCreatorSchema();

describe('rule engine', () => {
  it('clears futa-only fields when switching back to female mode', () => {
    const evaluated = evaluateCreatorState(schema, {
      mode: 'female',
      formValues: {
        'identity.mode': ['female'],
        'identity.persona': ['editorial-muse'],
        'physique.frame': ['hourglass'],
        'physique.features': ['soft-waist'],
        'physique.appendage': ['prominent'],
        'face.expression': ['inviting'],
        'face.finish': ['soft-glam'],
        'style.outfit': ['silk-robe'],
        'style.scene': ['vanity-suite'],
      },
    });

    expect(evaluated.fieldStates['physique.appendage'].visible).toBe(false);
    expect(evaluated.formValues['physique.appendage']).toEqual([]);
    expect(evaluated.notices[0]).toMatch(/cleared/i);
  });

  it('limits multi-select fields to the configured selection cap', () => {
    const evaluated = evaluateCreatorState(schema, {
      mode: 'female',
      formValues: {
        'identity.mode': ['female'],
        'identity.persona': ['editorial-muse'],
        'physique.frame': ['hourglass'],
        'physique.features': ['soft-waist', 'long-legs', 'full-bust'],
        'physique.appendage': [],
        'face.expression': ['inviting'],
        'face.finish': ['soft-glam'],
        'style.outfit': ['silk-robe'],
        'style.scene': ['vanity-suite'],
      },
    });

    expect(evaluated.formValues['physique.features']).toEqual(['soft-waist', 'long-legs']);
  });

  it('marks disabled fields with explicit reasons', () => {
    const evaluated = evaluateCreatorState(schema, {
      mode: 'female',
      formValues: {
        'identity.mode': ['female'],
        'identity.persona': ['glam-athlete'],
        'physique.frame': ['hourglass'],
        'physique.features': ['soft-waist'],
        'physique.appendage': [],
        'face.expression': ['inviting'],
        'face.finish': ['wet-glow'],
        'style.outfit': ['silk-robe'],
        'style.scene': ['vanity-suite'],
      },
    });

    expect(evaluated.fieldStates['face.finish'].disabled).toBe(true);
    expect(evaluated.fieldStates['face.finish'].disabledReason).toMatch(/restrained/i);
    expect(evaluated.formValues['face.finish']).toEqual([]);
  });

  it('requires appendage styling in futa mode', () => {
    const evaluated = evaluateCreatorState(schema, {
      mode: 'futa',
      formValues: {
        'identity.mode': ['futa'],
        'identity.persona': ['editorial-muse'],
        'physique.frame': ['hourglass'],
        'physique.features': ['soft-waist'],
        'physique.appendage': [],
        'face.expression': ['inviting'],
        'face.finish': ['soft-glam'],
        'style.outfit': ['silk-robe'],
        'style.scene': ['vanity-suite'],
      },
    });

    expect(evaluated.fieldStates['physique.appendage'].required).toBe(true);
    expect(evaluated.fieldStates['physique.appendage'].issues).toContain(
      'Required selection missing.',
    );
    expect(evaluated.isValid).toBe(false);
  });
});
