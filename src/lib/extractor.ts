import type {
  ComicFile,
  Page,
  ExtractionProgress,
  ExtractionResult,
  WorkerMessage,
} from "../types/comic";
import { detectFormat } from "./detect";
import ExtractionWorker from "./extraction.worker?worker";

let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new ExtractionWorker();
  }
  return worker;
}

async function extractCbrOnMainThread(
  file: File,
  onProgress?: (progress: ExtractionProgress) => void,
): Promise<ExtractionResult> {
  const { extractCbr } = await import("./cbr");
  const buffer = await file.arrayBuffer();
  const pages = await extractCbr(buffer, (extracted, total) => {
    onProgress?.({ pagesExtracted: extracted, totalFiles: total });
  });

  return {
    comic: {
      name: file.name,
      size: file.size,
      format: "cbr",
      extractionStatus: "ready",
      pageCount: pages.length,
    },
    pages,
  };
}

export function extractComic(
  file: File,
  onProgress?: (progress: ExtractionProgress) => void,
): Promise<ExtractionResult> {
  return new Promise((resolve, reject) => {
    // Quick format check — route CBR to main thread immediately
    const reader = new FileReader();
    reader.onload = () => {
      const header = new Uint8Array(reader.result as ArrayBuffer, 0, 4);
      const format = detectFormat(header.buffer as ArrayBuffer);

      if (format === "cbr") {
        extractCbrOnMainThread(file, onProgress).then(resolve, reject);
        return;
      }

      // CBZ and unknown: send to worker
      const w = getWorker();
      const pages: Page[] = [];

      const cleanup = () => {
        w.onmessage = null;
        w.onerror = null;
      };

      w.onerror = (err) => {
        cleanup();
        reject(new Error(err.message || "Worker error"));
      };

      w.onmessage = (e: MessageEvent<WorkerMessage>) => {
        const msg = e.data;

        switch (msg.type) {
          case "progress":
            onProgress?.({
              pagesExtracted: msg.pagesExtracted,
              totalFiles: msg.totalFiles,
            });
            break;

          case "page":
            pages.push(msg.page);
            break;

          case "complete": {
            cleanup();
            const comic: ComicFile = { ...msg.comic, name: file.name };
            resolve({ comic, pages });
            break;
          }

          case "error":
            cleanup();
            reject(new Error(msg.message));
            break;
        }
      };

      file.arrayBuffer().then((buffer) => {
        w.postMessage(buffer, [buffer]);
      }).catch(reject);
    };

    // Read just the first 4 bytes for format detection
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
}
