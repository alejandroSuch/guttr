import type { Page } from "../types/comic";
import { isImageFile, detectMimeType, createBlobUrl } from "./image";

export async function extractCbr(
  buffer: ArrayBuffer,
  onProgress?: (extracted: number, total: number) => void,
): Promise<Page[]> {
  const { createExtractorFromData } = await import("node-unrar-js");

  const wasmResponse = await fetch(`${import.meta.env.BASE_URL}unrar.wasm`);
  const wasmBinary = await wasmResponse.arrayBuffer();

  const extractor = await createExtractorFromData({ data: buffer, wasmBinary });
  const { files } = extractor.extract();

  // Collect image entries
  const imageFiles: { name: string; data: Uint8Array }[] = [];
  for (const file of files) {
    if (file.fileHeader.flags.directory) continue;
    if (!isImageFile(file.fileHeader.name)) continue;
    if (file.extraction) {
      imageFiles.push({ name: file.fileHeader.name, data: file.extraction });
    }
  }

  imageFiles.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true }),
  );

  const total = imageFiles.length;
  const pages: Page[] = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const entry = imageFiles[i];
    let blobUrl: string | null = null;
    let status: Page["status"] = "ready";
    let mimeType = "image/jpeg";

    try {
      mimeType = detectMimeType(entry.data);
      blobUrl = createBlobUrl(entry.data, mimeType);
    } catch {
      status = "error";
    }

    pages.push({
      index: i,
      filename: entry.name,
      blobUrl,
      mimeType,
      status,
    });
    onProgress?.(i + 1, total);
  }

  return pages;
}
