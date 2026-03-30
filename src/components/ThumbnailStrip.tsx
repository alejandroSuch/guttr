import { useRef, useEffect } from "react";
import type { Page } from "../types/comic";

interface ThumbnailStripProps {
  pages: Page[];
  currentPage: number;
  onSelect: (index: number) => void;
}

export function ThumbnailStrip({
  pages,
  currentPage,
  onSelect,
}: ThumbnailStripProps) {
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [currentPage]);

  return (
    <div className="thumbnail-strip">
      {pages.map((page) => (
        <div
          key={page.index}
          ref={page.index === currentPage ? activeRef : null}
          className={`thumbnail-strip__item ${
            page.index === currentPage ? "thumbnail-strip__item--active" : ""
          }`}
          onClick={() => onSelect(page.index)}
        >
          {page.blobUrl ? (
            <img
              className="thumbnail-strip__img"
              src={page.blobUrl}
              alt={`Page ${page.index + 1}`}
              loading="lazy"
            />
          ) : (
            <div className="thumbnail-strip__placeholder">
              {page.index + 1}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
