"use client";

import * as React from "react";
import { UploadCloud, X, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useUploadBannerImage } from "../hooks";
import type { UploadFileOutput } from "@/types";

export interface BannerImageUploadProps {
  imageUrl?: string | null;
  onChange: (objectKey: string, url: string) => void;
  onClear: () => void;
  disabled?: boolean;
  error?: string;
}

export function BannerImageUpload({
  imageUrl,
  onChange,
  onClear,
  disabled,
  error,
}: BannerImageUploadProps) {
  const upload = useUploadBannerImage();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const result: UploadFileOutput = await upload.mutateAsync(file);
        onChange(result.object_key, result.url);
      } catch {
        // toast handled in hook
      }
      // Reset so the same file can be re-selected.
      e.target.value = "";
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
        disabled={disabled || upload.isPending}
        id="banner-image-input"
      />

      {hasImage ? (
        <div className="relative mx-auto aspect-square w-1/2 max-w-[280px] overflow-hidden rounded-xl border border-hairline bg-surface-container-low">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl!}
            alt="Banner preview"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={upload.isPending}
                onClick={() => inputRef.current?.click()}
                aria-label="Thay đổi hình ảnh banner"
              >
                {upload.isPending ? (
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
                aria-label="Xoá hình ảnh banner"
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
          disabled={disabled || upload.isPending}
          className={cn(
            "mx-auto flex aspect-square w-1/2 max-w-[280px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-hairline bg-surface-container-low px-4 text-center text-muted-foreground transition-colors hover:border-primary/50 hover:bg-surface-container",
            error && "border-destructive",
            disabled && "cursor-not-allowed opacity-50",
          )}
          aria-label="Tải lên hình ảnh banner"
        >
          {upload.isPending ? (
            <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
          ) : (
            <ImageIcon className="h-8 w-8" aria-hidden="true" />
          )}
          <span className="text-[14px] font-medium">Tải lên hình ảnh (1920x800)</span>
          <span className="text-xs">PNG, JPG, WEBP · Tối đa 5 MB</span>
        </button>
      )}

      {error && (
        <p className="text-[14px] text-destructive" role="alert">{error}</p>
      )}
    </div>
  );
}
