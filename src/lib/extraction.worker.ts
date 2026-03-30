import { detectFormat } from "./detect";
import { extractCbz } from "./cbz";
import type { WorkerMessage } from "../types/comic";

function post(msg: WorkerMessage) {
  self.postMessage(msg);
}

self.onmessage = async (e: MessageEvent<ArrayBuffer>) => {
  const buffer = e.data;

  try {
    const format = detectFormat(buffer);

    if (format === "unknown") {
      post({ type: "error", message: "Unsupported file format. Only CBZ and CBR files are supported." });
      return;
    }

    if (format === "cbr") {
      // Signal main thread to handle CBR — unrar-wasm can't be bundled in worker
      post({ type: "error", message: "__CBR__" });
      return;
    }

    const onProgress = (pagesExtracted: number, totalFiles: number) => {
      post({ type: "progress", pagesExtracted, totalFiles });
    };

    const pages = await extractCbz(buffer, onProgress);

    if (pages.length === 0) {
      post({ type: "error", message: "This archive contains no readable pages." });
      return;
    }

    for (const page of pages) {
      post({ type: "page", page });
    }

    post({
      type: "complete",
      comic: {
        name: "",
        size: buffer.byteLength,
        format,
        extractionStatus: "ready",
        pageCount: pages.length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed";
    post({ type: "error", message });
  }
};
