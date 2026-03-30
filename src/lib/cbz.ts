import { unzip } from "fflate";
import type { Page } from "../types/comic";
import { isImageFile, detectMimeType, createBlobUrl } from "./image";

export function extractCbz(
  buffer: ArrayBuffer,
  onProgress?: (extracted: number, total: number) => void,
): Promise<Page[]> {
  return new Promise((resolve, reject) => {
    unzip(new Uint8Array(buffer), (err, result) => {
      if (err) {
        reject(new Error(`CBZ extraction failed: ${err.message}`));
        return;
      }

      const entries = Object.entries(result)
        .filter(([name]) => isImageFile(name) && !name.startsWith("__MACOSX"))
        .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));

      const total = entries.length;
      const pages: Page[] = [];

      for (let i = 0; i < entries.length; i++) {
        const [filename, data] = entries[i];
        const mimeType = detectMimeType(data);

        let blobUrl: string | null = null;
        let status: Page["status"] = "ready";

        try {
          blobUrl = createBlobUrl(data, mimeType);
        } catch {
          status = "error";
        }

        pages.push({ index: i, filename, blobUrl, mimeType, status });
        onProgress?.(i + 1, total);
      }

      resolve(pages);
    });
  });
}
