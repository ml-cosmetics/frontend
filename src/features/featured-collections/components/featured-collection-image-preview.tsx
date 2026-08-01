"use client";

import * as React from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { resolveImageUrl } from "@/lib/utils/image";

export interface FeaturedCollectionImagePreviewProps {
  imageUrl?: string | null;
  alt: string;
  /**
   * Edge length (px) of the square preview. Defaults to 88 — large
   * enough to read hero-art detail at a glance without crowding the
   * list. Callers can still override per surface (e.g. compact
   * sidebars).
   */
  size?: number;
  className?: string;
}

/**
 * Square preview tile used by the admin featured-collection list and
 * any other compact spot where the collection's hero image is shown
 * at a glance.
 *
 * Renders a square (aspect-square) at `size` so the subject stays
 * centered regardless of the source image's aspect ratio, and uses
 * `next/image` so the tile benefits from lazy-loading + intrinsic-size
 * handling. A local `onError` flag falls back to the placeholder icon
 * when the source 404s (broken keys still surface in seed data
 * occasionally).
 */
export function FeaturedCollectionImagePreview({
  imageUrl,
  alt,
  size = 88,
  className,
}: FeaturedCollectionImagePreviewProps) {
  const [failed, setFailed] = React.useState(false);
  const resolved = resolveImageUrl(imageUrl);
  const showImage = Boolean(resolved) && !failed;

  // Re-arm the failure flag whenever the upstream URL changes —
  // otherwise swapping to a working image wouldn't clear the fallback.
  React.useEffect(() => {
    setFailed(false);
  }, [resolved]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-hairline bg-surface-container-low shadow-sm",
        className,
      )}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {showImage ? (
        <Image
          src={resolved}
          alt={alt}
          fill
          sizes={`${size}px`}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          unoptimized
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="grid h-full w-full place-items-center text-muted-foreground"
          role="img"
          aria-label={imageUrl ? `${alt} — không tải được ảnh` : alt}
        >
          <ImageIcon className="h-7 w-7" aria-hidden="true" />
        </span>
      )}
    </div>
  );
}