"use client";

import * as React from "react";
import Image from "next/image";
import { Loader2, UploadCloud, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { resolveImageUrl } from "@/lib/utils/image";

export interface FeaturedCollectionImageUploadProps {
  imageUrl?: string | null;
  onChange: (key: string, url: string) => void;
  onClear: () => void;
  disabled?: boolean;
  error?: string;
  /**
   * Implementation that performs the actual upload. Returns
   * `{ image_key, image_url }` so the form can persist the
   * `image_key` while the preview uses the public URL.
   *
   * Defaults to `POST /v1/admin/upload` via `adminApiClient` — pages
   * that already have the upload mutation can pass it in to share
   * the toast / progress behaviour.
   */
  upload: (file: File) => Promise<{ image_key: string; image_url: string }>;
}

/**
 * The hero-image picker for the featured-collection edit form.
 *
 * Layout: a 16:9 tile capped at `max-w-xl` (so the preview doesn't
 * stretch across the entire form column on wide screens), with the
 * image rendered through `next/image` + `object-cover` so portrait
 * sources crop centrally instead of warping. Hovering the tile
 * reveals the replace / delete actions.
 *
 * The earlier implementation pinned the tile to `height: 180px` and
 * stretched full-width — that distorted portrait shots and pushed
 * landscape shots into a thin band. Switching to an aspect ratio
 * keeps the visible area proportional regardless of the column
 * width.
 */
export function FeaturedCollectionImageUpload({
  imageUrl,
  onChange,
  onClear,
  disabled,
  error,
  upload,
}: FeaturedCollectionImageUploadProps) {
  const [pending, setPending] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const resolved = resolveImageUrl(imageUrl);

  // Re-arm the failure flag whenever the upstream URL changes so a
  // successful re-upload re-renders the preview instead of leaving
  // the placeholder pinned.
  React.useEffect(() => {
    setFailed(false);
  }, [resolved]);

  const handleFileChange = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setPending(true);
      try {
        const result = await upload(file);
        onChange(result.image_key, result.image_url);
      } catch {
        // Error surface owned by the upload hook; keep the input quiet.
      } finally {
        setPending(false);
        // Reset so the same file can be re-selected after a clear.
        e.target.value = "";
      }
    },
    [upload, onChange],
  );

  const hasImage = Boolean(imageUrl);

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={handleFileChange}
        disabled={disabled || pending}
        id="featured-collection-image-input"
      />

      {hasImage ? (
        <div
          className="group/preview relative w-full max-w-xl overflow-hidden rounded-xl border border-hairline bg-surface-container-low"
          style={{ aspectRatio: "16 / 10" }}
        >
          {resolved && !failed ? (
            <Image
              src={resolved}
              alt="Preview bộ sưu tập"
              fill
              sizes="(min-width: 1024px) 512px, 100vw"
              className="object-cover"
              unoptimized
              onError={() => setFailed(true)}
            />
          ) : (
            <span
              className="grid h-full w-full place-items-center text-muted-foreground"
              role="img"
              aria-label={failed ? "Không tải được ảnh" : "Chưa có ảnh"}
            >
              <ImageIcon className="h-10 w-10" aria-hidden="true" />
            </span>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/preview:opacity-100 focus-within:opacity-100">
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={pending}
                onClick={() => inputRef.current?.click()}
                aria-label="Thay đổi hình ảnh"
              >
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <UploadCloud className="h-4 w-4" aria-hidden="true" />
                )}
                Thay đổi
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={onClear}
                disabled={disabled}
                aria-label="Xoá hình ảnh"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || pending}
          className={cn(
            "flex w-full max-w-xl flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-hairline bg-surface-container-low py-10 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-surface-container",
            error && "border-destructive",
            disabled && "cursor-not-allowed opacity-50",
          )}
          style={{ aspectRatio: "16 / 10" }}
          aria-label="Tải lên hình ảnh bộ sưu tập"
        >
          {pending ? (
            <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
          ) : (
            <ImageIcon className="h-8 w-8" aria-hidden="true" />
          )}
          <span className="text-[14px] font-medium">
            Tải lên hình ảnh bộ sưu tập
          </span>
          <span className="text-xs">PNG, JPG, WEBP · Tối đa 30 MB</span>
        </button>
      )}

      {error && (
        <p className="text-[14px] text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}