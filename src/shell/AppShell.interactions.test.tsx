import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { useCreatorStore } from '../features/creator/store';
import { useLibraryStore } from '../features/library/store';
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
    useLibraryStore.getState().resetLibrary();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  function renderApp(route = '/build') {
    render(
      <MemoryRouter initialEntries={[route]}>
        <AppShell />
      </MemoryRouter>,
    );
  }

  it('navigates categories with horizontal swipe intent', () => {
    renderApp();

    swipeLeft(screen.getByTestId('swipe-surface'));

    expect(
      screen.getAllByRole('heading', { name: 'Physique' }).length,
    ).toBeGreaterThan(0);
  });

  it('lets users toggle into the futa mode and reveals dependent anatomy fields', () => {
    renderApp();

    fireEvent.click(screen.getAllByRole('button', { name: 'Futa-Female' })[0]);
    fireEvent.click(screen.getByRole('button', { name: /Physique/i }));

    expect(
      screen.getByRole('heading', { name: 'Appendage styling' }),
    ).toBeInTheDocument();
  });

  it('generates a prompt package and opens review output', async () => {
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: 'Generate package' }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Generated prompt' }),
      ).toBeInTheDocument();
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('saves a preset and restores it from the preset strip', async () => {
    renderApp('/gen');

    fireEvent.click(screen.getByRole('button', { name: 'Build' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Futa-Female' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Gen' }));
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Save doll' }),
      ).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save doll' }));
    fireEvent.click(screen.getByRole('button', { name: 'Home' }));
    fireEvent.click(screen.getByRole('button', { name: /Preset 01 - Futa/i }));

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: 'Futa-Female' })[0],
      ).toHaveClass('is-active');
    });
  });

  it('captures a bridge image event into the local gallery', async () => {
    renderApp('/gen');

    fireEvent.click(
      screen.getByRole('button', { name: 'Push to Venice Bridge' }),
    );
    await act(async () => {
      window.dispatchEvent(
        new CustomEvent('xgen:image-received', {
          detail: {
            nonce: useLibraryStore.getState().gallery[0]?.nonce,
            dataUrl: 'data:image/png;base64,abc123',
          },
        }),
      );
    });

    fireEvent.click(screen.getByRole('button', { name: 'Gallery' }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Tap to load this render back into the Creation Kit./i,
        ),
      ).toBeInTheDocument();
    });
  });
});
