import { render, screen } from '@testing-library/react';

import { AppShell } from './AppShell';

describe('AppShell', () => {
  it('renders the mobile creator shell scaffolding', () => {
    render(<AppShell />);

    expect(screen.getByRole('heading', { name: 'Dollify' })).toBeInTheDocument();
    expect(screen.getByText(/phone-first workspace scaffold/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Randomize' })).toBeDisabled();
  });
});
