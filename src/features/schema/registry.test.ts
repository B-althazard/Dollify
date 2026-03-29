import { getCreatorSchema, getSchemaCategoryIds } from './registry';

describe('schema registry', () => {
  it('loads the external schema metadata', () => {
    const schema = getCreatorSchema();

    expect(schema.version).toBe('1.0.0');
    expect(schema.categories).toHaveLength(4);
    expect(schema.fields.some((field) => field.id === 'identity.mode')).toBe(
      true,
    );
  });

  it('exposes category ids for creator navigation', () => {
    expect(getSchemaCategoryIds()).toEqual([
      'identity',
      'physique',
      'face',
      'style',
    ]);
  });
});
