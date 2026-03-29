import { getDefaultSnapshot } from './store';

describe('creator store defaults', () => {
  it('initializes a valid default creator snapshot from schema data', () => {
    const snapshot = getDefaultSnapshot();

    expect(snapshot.version).toBe('1.0.0');
    expect(snapshot.mode).toBe('female');
    expect(snapshot.activeCategoryId).toBe('identity');
    expect(snapshot.formValues['identity.mode']).toEqual(['female']);
    expect(snapshot.formValues['physique.frame']).toEqual(['hourglass']);
  });
});
