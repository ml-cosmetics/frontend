"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { FileText, UploadCloud, X } from "lucide-react";
import { Button } from "./button";

/**
 * Aura Vénus FileUpload — 16 px radius dashed drop zone, 1 px hairline,
 * hovers to primary purple tint.
 */
export interface FileUploadValue {
  url: string;
  file?: File;
  name: string;
  size?: number;
}

export interface FileUploadProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: FileUploadValue[];
  defaultValue?: FileUploadValue[];
  onChange?: (value: FileUploadValue[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  placeholder?: string;
}

const formatSize = (bytes?: number) => {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(1)} ${units[i]}`;
};

export const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      className,
      value: controlled,
      defaultValue,
      onChange,
      multiple = true,
      accept,
      maxSizeMB = 25,
      disabled,
      placeholder = "Kéo & thả tệp vào đây, hoặc nhấp để chọn",
      ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = React.useState<FileUploadValue[]>(defaultValue ?? []);
    const files = controlled ?? internal;
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const setFiles = React.useCallback(
      (next: FileUploadValue[]) => {
        if (controlled === undefined) setInternal(next);
        onChange?.(next);
      },
      [controlled, onChange],
    );

    const ingest = (incoming: FileList | File[]) => {
      setError(null);
      const arr = Array.from(incoming);
      const accepted: FileUploadValue[] = [];
      for (const f of arr) {
        if (f.size > maxSizeMB * 1024 * 1024) {
          setError(`Tệp "${f.name}" vượt quá ${maxSizeMB} MB.`);
          continue;
        }
        accepted.push({ url: URL.createObjectURL(f), file: f, name: f.name, size: f.size });
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
            "flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2",
            "rounded-xl border border-dashed border-hairline bg-surface-container-low px-6 py-6 text-center",
            "transition-colors hover:border-primary/40 hover:bg-surface-container",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            dragOver && "border-primary bg-primary/5",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          <UploadCloud className="h-6 w-6 text-muted-foreground" />
          <p className="text-[14px] font-medium text-foreground">{placeholder}</p>
          <p className="text-[12px] text-muted-foreground">Tối đa {maxSizeMB} MB / tệp</p>
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

        {files.length > 0 && (
          <ul className="divide-y divide-hairline overflow-hidden rounded-xl border border-hairline">
            {files.map((f, i) => (
              <li
                key={`${f.url}-${i}`}
                className="flex items-center gap-3 px-4 py-3 text-[14px]"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{f.name}</p>
                  {f.size !== undefined && (
                    <p className="text-[12px] text-muted-foreground">{formatSize(f.size)}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => remove(i)}
                  aria-label={`Xóa ${f.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
);
FileUpload.displayName = "FileUpload";
