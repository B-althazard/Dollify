import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useCreatorStore } from '../features/creator/store';
import { AppShell } from './AppShell';

describe('AppShell', () => {
  beforeEach(() => {
    useCreatorStore.getState().resetCreator();
  });

  it('renders schema-driven creator controls from external metadata', () => {
    render(
      <MemoryRouter initialEntries={['/build']}>
        <AppShell />
      </MemoryRouter>,
    );

    expect(screen.getByText(/^Build$/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Settings temporarily unavailable',
      }),
    ).toBeDisabled();
    expect(
      screen.getAllByRole('heading', { name: 'Identity' }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole('heading', { name: 'Persona direction' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Generate package' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Generate package' }),
    ).toBeEnabled();
  });
});
