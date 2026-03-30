import { useRef, useMemo, type TouchEvent } from "react";

interface UseSwipeOptions {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  threshold?: number;
  enabled?: boolean;
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  enabled = true,
}: UseSwipeOptions) {
  const startX = useRef(0);
  const startY = useRef(0);
  const wasPinch = useRef(false);

  return useMemo(
    () => ({
      onTouchStart: (e: TouchEvent) => {
        if (e.touches.length >= 2) {
          wasPinch.current = true;
        } else {
          wasPinch.current = false;
          startX.current = e.touches[0].clientX;
          startY.current = e.touches[0].clientY;
        }
      },
      onTouchMove: (e: TouchEvent) => {
        if (e.touches.length >= 2) {
          wasPinch.current = true;
        }
      },
      onTouchEnd: (e: TouchEvent) => {
        if (!enabled || wasPinch.current) {
          return;
        }

        const deltaX = e.changedTouches[0].clientX - startX.current;
        const deltaY = e.changedTouches[0].clientY - startY.current;

        // Only trigger if horizontal movement exceeds vertical
        if (Math.abs(deltaX) < threshold || Math.abs(deltaX) < Math.abs(deltaY)) {
          return;
        }

        if (deltaX > 0) {
          onSwipeRight();
        } else {
          onSwipeLeft();
        }
      },
    }),
    [onSwipeLeft, onSwipeRight, threshold, enabled],
  );
}
