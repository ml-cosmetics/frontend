/**
 * Resolve image URLs served by the backend.
 *
 * The backend always returns fully-qualified URLs (http/https) for all
 * image fields (`image_url`, `thumbnail_url`). This helper normalises
 * edge cases so the value is always safe to drop into an `<Image src>`.
 *
 * Supported shapes on the wire:
 *
 *  1. A fully-qualified absolute URL (http/https) — returned as-is.
 *  2. A backend-relative path (`/v1/storage/...`) — prefixed with
 *     the API base URL.
 *
 * Empty / null input returns the provided fallback (or empty string).
 */
export function resolveImageUrl(
  url: string | null | undefined,
  fallback = "",
): string {
  if (!url) return fallback;

  // Already an absolute URL — return as-is.
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  // Backend-relative path (e.g. `/v1/storage/...`) → API base.
  if (url.startsWith("/")) {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
    return `${apiBase}${url}`;
  }

  // Opaque value (shouldn't happen when backend resolves URLs properly,
  // but kept as a safety net) — return as-is.
  return url;
}

/**
 * Convenience for `<Image placeholder>` blur-up. Returns a 1×1
 * transparent data URL so callers can drop it into the `blurDataURL`
 * prop without branching at the call site.
 */
export const BLUR_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
