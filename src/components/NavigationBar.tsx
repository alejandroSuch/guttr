import type { ReadingDirection, ScalingMode } from "../types/comic";

interface NavigationBarProps {
  currentPage: number;
  totalPages: number;
  direction: ReadingDirection;
  scalingMode: ScalingMode;
  visible: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToggleDirection: () => void;
  onToggleScalingMode: () => void;
  onToggleThumbnails?: () => void;
}

export function NavigationBar({
  currentPage,
  totalPages,
  direction,
  scalingMode,
  visible,
  onPrev,
  onNext,
  onToggleDirection,
  onToggleScalingMode,
  onToggleThumbnails,
}: NavigationBarProps) {
  return (
    <nav className={`nav-bar${visible ? "" : " nav-bar--hidden"}`}>
      <button onClick={onPrev} disabled={currentPage === 0}>
        {direction === "ltr" ? "\u2190" : "\u2192"}
      </button>
      <span className="nav-bar__page">
        Page {currentPage + 1} of {totalPages}
      </span>
      <button onClick={onNext} disabled={currentPage === totalPages - 1}>
        {direction === "ltr" ? "\u2192" : "\u2190"}
      </button>
      <button
        className="nav-bar__direction"
        onClick={onToggleScalingMode}
        title={scalingMode === "fit-width" ? "Switch to fit height" : "Switch to fit width"}
      >
        {scalingMode === "fit-width" ? "W" : "H"}
      </button>
      <button
        className="nav-bar__direction"
        onClick={onToggleDirection}
        title={direction === "ltr" ? "Switch to RTL (manga)" : "Switch to LTR"}
      >
        {direction === "ltr" ? "LTR" : "RTL"}
      </button>
      {onToggleThumbnails && (
        <button onClick={onToggleThumbnails} title="Thumbnails">
          &#9638;
        </button>
      )}
    </nav>
  );
}
