import type { Page, ScalingMode } from "../types/comic";

interface PageViewProps {
  page: Page;
  scalingMode?: ScalingMode;
}

export function PageView({ page, scalingMode = "fit-width" }: PageViewProps) {
  if (page.status === "error" || !page.blobUrl) {
    return (
      <div className="page-view page-view--error">
        <p>This page could not be loaded</p>
        <p className="page-view__filename">{page.filename}</p>
      </div>
    );
  }

  return (
    <img
      className={`page-view${scalingMode === "fit-height" ? " page-view--fit-height" : ""}`}
      src={page.blobUrl}
      alt={`Page ${page.index + 1}`}
      draggable={false}
    />
  );
}
