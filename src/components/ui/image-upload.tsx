"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { ImageIcon, UploadCloud, X } from "lucide-react";
import { Button } from "./button";

/**
 * Aura Vénus ImageUpload — 16 px radius dashed drop zone.
 */
export interface ImageUploadValue {
  url: string;
  file?: File;
  name?: string;
}

export interface ImageUploadProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: ImageUploadValue[];
  defaultValue?: ImageUploadValue[];
  onChange?: (value: ImageUploadValue[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSizeMB?: number;
  maxFiles?: number;
  disabled?: boolean;
  placeholder?: string;
  emptyMessage?: string;
}

export const ImageUpload = React.forwardRef<HTMLDivElement, ImageUploadProps>(
  (
    {
      className,
      value: controlled,
      defaultValue,
      onChange,
      multiple = true,
      accept = "image/*",
      maxSizeMB = 5,
      maxFiles,
      disabled,
      placeholder = "Kéo & thả ảnh vào đây, hoặc nhấp để chọn",
      emptyMessage = "Chưa có ảnh nào",
      ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = React.useState<ImageUploadValue[]>(defaultValue ?? []);
    const files = controlled ?? internal;
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const setFiles = React.useCallback(
      (next: ImageUploadValue[]) => {
        if (controlled === undefined) setInternal(next);
        onChange?.(next);
      },
      [controlled, onChange],
    );

    const ingest = (incoming: FileList | File[]) => {
      setError(null);
      const arr = Array.from(incoming);
      const remaining = maxFiles ? Math.max(0, maxFiles - files.length) : Infinity;
      const accepted: ImageUploadValue[] = [];
      for (const f of arr.slice(0, remaining)) {
        if (f.size > maxSizeMB * 1024 * 1024) {
          setError(`Tệp "${f.name}" vượt quá ${maxSizeMB} MB.`);
          continue;
        }
        const url = URL.createObjectURL(f);
        accepted.push({ url, file: f, name: f.name });
      }
      if (accepted.length) setFiles([...files, ...accepted]);
    };

    const remove = (index: number) => {
      const removed = files[index];
      if (removed?.url.startsWith("blob:")) URL.revokeObjectURL(removed.url);
      setFiles(files.filter((_, i) => i !== index));
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      if (e.dataTransfer.files?.length) ingest(e.dataTransfer.files);
    };

    return (
      <div ref={ref} className={cn("flex flex-col gap-3", className)} {...props}>
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (!disabled && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-2",
            "rounded-xl border border-dashed border-hairline bg-surface-container-low px-6 py-8 text-center",
            "transition-colors hover:border-primary/40 hover:bg-surface-container",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            dragOver && "border-primary bg-primary/5",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          <UploadCloud className="h-8 w-8 text-muted-foreground" />
          <p className="text-[14px] font-medium text-foreground">{placeholder}</p>
          <p className="text-[12px] text-muted-foreground">
            PNG, JPG, WEBP tối đa {maxSizeMB} MB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) ingest(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {error && (
          <p className="text-[14px] text-destructive" role="alert">
            {error}
          </p>
        )}

        {files.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {files.map((f, i) => (
              <li
                key={`${f.url}-${i}`}
                className="group relative aspect-square overflow-hidden rounded-xl border border-hairline bg-surface-container-low"
              >
                {f.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={f.url}
                    alt={f.name ?? `image-${i}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => remove(i)}
                  aria-label="Xóa ảnh"
                >
                  <X className="h-3 w-3" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-[14px] text-muted-foreground">{emptyMessage}</p>
        )}
      </div>
    );
  },
);
ImageUpload.displayName = "ImageUpload";
