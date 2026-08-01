"use client";

import * as React from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { resolveImageUrl } from "@/lib/utils";

export interface BannerImagePreviewProps {
  imageUrl?: string | null;
  alt?: string;
  className?: string;
  /** Width in pixels (height is 16:9). Defaults to 64. */
  width?: number;
}

export function BannerImagePreview({
  imageUrl,
  alt = "Banner",
  className,
  width = 64,
}: BannerImagePreviewProps) {
  const [failed, setFailed] = React.useState(false);
  const src = imageUrl && !failed ? resolveImageUrl(imageUrl) : null;
  const height = Math.round(width * (9 / 16));

  return (
    <div
      className={className}
      style={{ width, height }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${width}px`}
          className="rounded-lg object-cover"
          unoptimized
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-lg border border-hairline bg-surface-container-low">
          <ImageOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
