import { useMemo, useRef } from 'react';

interface SwipeOptions {
  itemIds: string[];
  activeId: string;
  threshold?: number;
  onNavigate: (nextId: string) => void;
}

export function useSwipeNavigation({
  itemIds,
  activeId,
  threshold = 56,
  onNavigate,
}: SwipeOptions) {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  return useMemo(
    () => ({
      onTouchStart: (event: React.TouchEvent<HTMLElement>) => {
        const touch = event.touches[0];
        startRef.current = { x: touch.clientX, y: touch.clientY };
      },
      onTouchEnd: (event: React.TouchEvent<HTMLElement>) => {
        const start = startRef.current;

        if (!start) {
          return;
        }

        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - start.x;
        const deltaY = touch.clientY - start.y;
        const horizontalIntent = Math.abs(deltaX) > Math.abs(deltaY) * 1.2;

        if (!horizontalIntent || Math.abs(deltaX) < threshold) {
          return;
        }

        const activeIndex = itemIds.indexOf(activeId);
        const nextIndex = deltaX < 0 ? activeIndex + 1 : activeIndex - 1;
        const nextId = itemIds[nextIndex];

        if (nextId) {
          onNavigate(nextId);
        }
      },
    }),
    [activeId, itemIds, onNavigate, threshold],
  );
}
