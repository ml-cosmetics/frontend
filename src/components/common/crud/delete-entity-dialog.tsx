"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * `DeleteEntityDialog` — generic destructive confirm dialog.
 *
 * Aura Vénus styling: 16 px radius panel, 1 px hairline border, accent
 * shadow on the overlay (Stitch glassmorphism wash).
 */
export interface DeleteEntityDialogProps {
  open: boolean;
  title?: string;
  entityName?: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  submitting?: boolean;
  error?: unknown;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteEntityDialog({
  open,
  title = "Xoá mục này?",
  entityName,
  description,
  confirmLabel = "Xoá",
  cancelLabel = "Huỷ",
  submitting,
  error,
  onConfirm,
  onCancel,
}: DeleteEntityDialogProps) {
  if (!open) return null;

  const message: React.ReactNode = description ?? (
    <>
      Hành động này không thể hoàn tác.
      {entityName && (
        <>
          {" "}
          Mục <strong>{entityName}</strong> sẽ bị xoá vĩnh viễn.
        </>
      )}
    </>
  );

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="crud-delete-title"
      aria-describedby="crud-delete-description"
        className="fixed inset-0 z-50 grid place-items-center aura-glass p-4 backdrop-blur-[12px]"
    >
      <div className="w-full max-w-md rounded-xl border border-hairline bg-card p-6 aura-shadow-sm">
        <h2
          id="crud-delete-title"
          className="text-[18px] font-semibold leading-[1.3] text-foreground"
        >
          {title}
        </h2>
        <p
          id="crud-delete-description"
          className="mt-2 text-[14px] leading-[1.6] text-muted-foreground"
        >
          {message}
        </p>
        {Boolean(error) && (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-[14px] leading-[1.6] text-destructive"
          >
            {error instanceof Error
              ? error.message
              : typeof error === "object" &&
                  error !== null &&
                  "message" in error
                ? String((error as { message?: unknown }).message)
                : "Đã xảy ra lỗi."}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={submitting}
              className="text-[14px] leading-[1.6]"
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
              disabled={submitting}
              aria-busy={submitting || undefined}
              className="text-[14px] leading-[1.6]"
            >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
