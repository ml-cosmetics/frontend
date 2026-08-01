import type { MediaKind } from "@/types";

/**
 * Vietnamese label for each media kind. Used in the type filter
 * dropdown and on the asset card chips.
 */
export function getKindLabel(kind: MediaKind): string {
  switch (kind) {
    case "image":
      return "Ảnh";
    case "video":
      return "Video";
    case "document":
      return "Tài liệu";
    case "other":
    default:
      return "Khác";
  }
}

/**
 * Tailwind classes for the media kind chip. Mirrors the dark
 * LuxeOps palette (cool surface for image, primary pink for video,
 * amber for document, neutral for other) — categorical multi-hue
 * palette, intentionally not the brand primary.
 */
export function getKindChipClass(kind: MediaKind): string {
  switch (kind) {
    case "image":
      return "border-[#3f3f46] bg-[#27272a] text-[#e4e4e7]";
    case "video":
      return "border-violet-900/50 bg-violet-900/30 text-violet-300";
    case "document":
      return "border-amber-900/50 bg-amber-900/30 text-amber-300";
    case "other":
    default:
      return "border-[#3f3f46] bg-[#27272a] text-[#a1a1aa]";
  }
}

/**
 * Format a byte count for human display (e.g. 1.2 MB, 800 KB).
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
