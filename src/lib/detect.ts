export type ArchiveFormat = "cbz" | "cbr" | "unknown";

const ZIP_MAGIC = [0x50, 0x4b]; // PK
const RAR_MAGIC = [0x52, 0x61, 0x72, 0x21]; // Rar!

export function detectFormat(buffer: ArrayBuffer): ArchiveFormat {
  const bytes = new Uint8Array(buffer, 0, 4);

  if (bytes[0] === RAR_MAGIC[0] && bytes[1] === RAR_MAGIC[1] &&
      bytes[2] === RAR_MAGIC[2] && bytes[3] === RAR_MAGIC[3]) {
    return "cbr";
  }

  if (bytes[0] === ZIP_MAGIC[0] && bytes[1] === ZIP_MAGIC[1]) {
    return "cbz";
  }

  return "unknown";
}
