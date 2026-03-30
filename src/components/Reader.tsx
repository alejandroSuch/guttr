import { useState, useCallback, useRef, useEffect, useSyncExternalStore } from "react";
import type { Page, ReadingDirection, ScalingMode } from "../types/comic";
import { AppHeader } from "./AppHeader";
import { PageView } from "./PageView";
import { NavigationBar } from "./NavigationBar";
import { ThumbnailStrip } from "./ThumbnailStrip";
import { useSwipe } from "../hooks/useSwipe";
import { useKeyboardNav } from "../hooks/useKeyboardNav";

interface ReaderProps {
  pages: Page[];
  initialPage?: number;
  initialDirection?: ReadingDirection;
  initialScalingMode?: ScalingMode;
  onPageChange?: (page: number) => void;
  onDirectionChange?: (direction: ReadingDirection) => void;
  onScalingModeChange?: (mode: ScalingMode) => void;
}

export function Reader({
  pages,
  initialPage = 0,
  initialDirection = "ltr",
  initialScalingMode = "fit-width",
  onPageChange,
  onDirectionChange,
  onScalingModeChange,
}: ReaderProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [direction, setDirection] = useState<ReadingDirection>(initialDirection);
  const [scalingMode, setScalingMode] = useState<ScalingMode>(initialScalingMode);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (page: number) => {
      const clamped = Math.max(0, Math.min(page, pages.length - 1));
      setCurrentPage(clamped);
      onPageChange?.(clamped);
    },
    [pages.length, onPageChange],
  );

  const next = useCallback(() => goTo(currentPage + 1), [currentPage, goTo]);
  const prev = useCallback(() => goTo(currentPage - 1), [currentPage, goTo]);

  const toggleDirection = useCallback(() => {
    const newDir = direction === "ltr" ? "rtl" : "ltr";
    setDirection(newDir);
    onDirectionChange?.(newDir);
  }, [direction, onDirectionChange]);

  const toggleScalingMode = useCallback(() => {
    const newMode = scalingMode === "fit-width" ? "fit-height" : "fit-width";
    setScalingMode(newMode);
    onScalingModeChange?.(newMode);
  }, [scalingMode, onScalingModeChange]);

  const handleThumbnailSelect = useCallback(
    (index: number) => {
      goTo(index);
      setShowThumbnails(false);
    },
    [goTo],
  );

  const zoomScale = useSyncExternalStore(
    (cb) => {
      const vv = window.visualViewport;
      if (!vv) return () => {};
      vv.addEventListener("resize", cb);
      return () => vv.removeEventListener("resize", cb);
    },
    () => window.visualViewport?.scale ?? 1,
  );

  const swipeHandlers = useSwipe({
    onSwipeLeft: direction === "ltr" ? next : prev,
    onSwipeRight: direction === "ltr" ? prev : next,
    enabled: zoomScale <= 1,
  });

  useKeyboardNav({
    onNext: next,
    onPrev: prev,
    direction,
    enabled: !showThumbnails,
  });

  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
  }, [currentPage]);

  const handleContentClick = useCallback(() => {
    setShowNav((s) => !s);
  }, []);

  return (
    <div className="reader">
      <AppHeader visible={showNav} />
      <div
        className={`reader__content${scalingMode === "fit-height" ? " reader__content--fit-height" : ""}`}
        ref={contentRef}
        onClick={handleContentClick}
        {...swipeHandlers}
      >
        {showThumbnails ? (
          <ThumbnailStrip
            pages={pages}
            currentPage={currentPage}
            onSelect={handleThumbnailSelect}
          />
        ) : (
          <PageView page={pages[currentPage]} scalingMode={scalingMode} />
        )}
      </div>
      <NavigationBar
        currentPage={currentPage}
        totalPages={pages.length}
        direction={direction}
        scalingMode={scalingMode}
        visible={showNav}
        onPrev={prev}
        onNext={next}
        onToggleDirection={toggleDirection}
        onToggleScalingMode={toggleScalingMode}
        onToggleThumbnails={() => setShowThumbnails((s) => !s)}
      />
    </div>
  );
}
