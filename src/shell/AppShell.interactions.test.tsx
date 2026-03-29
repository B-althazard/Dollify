import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { useCreatorStore } from '../features/creator/store';
import { AppShell } from './AppShell';

function swipeLeft(element: HTMLElement) {
  fireEvent.touchStart(element, {
    touches: [{ clientX: 220, clientY: 220 }],
  });
  fireEvent.touchEnd(element, {
    changedTouches: [{ clientX: 120, clientY: 226 }],
  });
}

describe('AppShell mobile interactions', () => {
  beforeEach(() => {
    useCreatorStore.getState().resetCreator();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('navigates categories with horizontal swipe intent', () => {
    render(<AppShell />);

    swipeLeft(screen.getByTestId('swipe-surface'));

    expect(
      screen.getAllByRole('heading', { name: 'Physique' }).length,
    ).toBeGreaterThan(0);
  });

  it('lets users toggle into the futa mode and reveals dependent anatomy fields', () => {
    render(<AppShell />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Futa-Female' })[0]);
    fireEvent.click(screen.getByRole('button', { name: /Physique/i }));

    expect(
      screen.getByRole('heading', { name: 'Appendage styling' }),
    ).toBeInTheDocument();
  });

  it('generates a prompt package and opens review output', async () => {
    render(<AppShell />);

    fireEvent.click(screen.getByRole('button', { name: 'Generate package' }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Positive prompt' }),
      ).toBeInTheDocument();
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
