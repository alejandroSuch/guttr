const JPEG_MAGIC = [0xff, 0xd8];
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];
const GIF_MAGIC = [0x47, 0x49, 0x46, 0x38]; // GIF8
const WEBP_RIFF = [0x52, 0x49, 0x46, 0x46]; // RIFF

const IMAGE_EXTENSIONS = new Set([
  ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp",
]);

export function isImageFile(filename: string): boolean {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}

export function detectMimeType(data: Uint8Array): string {
  if (data.length < 4) return "image/jpeg";

  if (data[0] === PNG_MAGIC[0] && data[1] === PNG_MAGIC[1] &&
      data[2] === PNG_MAGIC[2] && data[3] === PNG_MAGIC[3]) {
    return "image/png";
  }
  if (data[0] === JPEG_MAGIC[0] && data[1] === JPEG_MAGIC[1]) {
    return "image/jpeg";
  }
  if (data[0] === GIF_MAGIC[0] && data[1] === GIF_MAGIC[1] &&
      data[2] === GIF_MAGIC[2] && data[3] === GIF_MAGIC[3]) {
    return "image/gif";
  }
  if (data[0] === WEBP_RIFF[0] && data[1] === WEBP_RIFF[1] &&
      data[2] === WEBP_RIFF[2] && data[3] === WEBP_RIFF[3] &&
      data.length > 11 && data[8] === 0x57 && data[9] === 0x45 &&
      data[10] === 0x42 && data[11] === 0x50) {
    return "image/webp";
  }

  return "image/jpeg";
}

export function createBlobUrl(data: Uint8Array, mimeType: string): string {
  const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
  const blob = new Blob([arrayBuffer], { type: mimeType });
  return URL.createObjectURL(blob);
}

export function revokeBlobUrl(url: string): void {
  URL.revokeObjectURL(url);
}

export function revokeAllBlobUrls(urls: (string | null)[]): void {
  for (const url of urls) {
    if (url) URL.revokeObjectURL(url);
  }
}
