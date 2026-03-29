import { render, screen } from '@testing-library/react';

import { AppShell } from './AppShell';

describe('AppShell', () => {
  it('renders schema-driven creator controls from external metadata', () => {
    render(<AppShell />);

    expect(screen.getByRole('heading', { name: 'Dollify' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: 'Identity' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Persona direction' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Randomize' })).toBeDisabled();
  });
});
