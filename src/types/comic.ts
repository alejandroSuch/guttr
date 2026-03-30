export type ExtractionStatus = "idle" | "extracting" | "ready" | "error";

export type PageStatus = "pending" | "ready" | "error";

export type ReadingDirection = "ltr" | "rtl";

export type ScalingMode = "fit-width" | "fit-height";

export interface ComicFile {
  name: string;
  size: number;
  format: "cbz" | "cbr";
  extractionStatus: ExtractionStatus;
  pageCount: number;
}

export interface Page {
  index: number;
  filename: string;
  blobUrl: string | null;
  mimeType: string;
  status: PageStatus;
}

export interface ReadingSession {
  fileId: string;
  currentPage: number;
  lastRead: string;
  readingDirection: ReadingDirection;
  scalingMode?: ScalingMode;
}

export interface ExtractionProgress {
  pagesExtracted: number;
  totalFiles: number;
}

export interface ExtractionResult {
  comic: ComicFile;
  pages: Page[];
}

export type WorkerMessage =
  | { type: "progress"; pagesExtracted: number; totalFiles: number }
  | { type: "page"; page: Page }
  | { type: "complete"; comic: ComicFile }
  | { type: "error"; message: string };
