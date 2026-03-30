import { useEffect } from "react";
import type { ReadingDirection } from "../types/comic";

interface UseKeyboardNavOptions {
  onNext: () => void;
  onPrev: () => void;
  direction: ReadingDirection;
  enabled: boolean;
}

export function useKeyboardNav({
  onNext,
  onPrev,
  direction,
  enabled,
}: UseKeyboardNavOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        direction === "ltr" ? onNext() : onPrev();
      } else if (e.key === "ArrowLeft") {
        direction === "ltr" ? onPrev() : onNext();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNext, onPrev, direction, enabled]);
}
