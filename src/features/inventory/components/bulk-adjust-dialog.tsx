"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBulkAdjustInventory } from "../hooks/use-bulk-adjust-inventory";
import type { InventoryRow } from "./columns";

const bulkAdjustSchema = z.object({
  delta: z.coerce
    .number({ required_error: "Số lượng là bắt buộc.", invalid_type_error: "Phải là số." })
    .int("Phải là số nguyên.")
    .refine((n) => n !== 0, { message: "Số lượng không được bằng 0." }),
  reason: z.string().max(500, "Lý do tối đa 500 ký tự.").optional(),
});

type BulkAdjustFormValues = z.infer<typeof bulkAdjustSchema>;

export interface BulkAdjustDialogProps {
  rows: InventoryRow[];
  onClose: () => void;
  /** Optional initial delta; positive for stock-in, negative for stock-out. */
  defaultDelta?: number;
  /** Override the default dialog title (Nhập/Xuất/etc.). */
  title?: string;
  /** Override the default submit button label. */
  confirmLabel?: string;
}

/**
 * `BulkAdjustDialog` — modal for adjusting many inventory rows in
 * one go. The dialog shows the count of rows that will be touched
 * and a preview of the new quantity for the first row (assuming all
 * selected rows have similar stock levels — actual backend response
 * may differ for rows that would go negative).
 */
export function BulkAdjustDialog({
  rows,
  onClose,
  defaultDelta,
  title,
  confirmLabel,
}: BulkAdjustDialogProps) {
  const mutation = useBulkAdjustInventory();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState,
  } = useForm<BulkAdjustFormValues>({
    resolver: zodResolver(bulkAdjustSchema),
    defaultValues: { delta: defaultDelta ?? 0, reason: "" },
    mode: "onSubmit",
  });

  const delta = watch("delta");
  const errors = formState.errors;
  const sample = rows[0];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    dialog.addEventListener("keydown", handleKey);
    return () => dialog.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    if (mutation.isPending) return;
    await mutation.mutateAsync({
      ids: rows.map((r) => r.id),
      delta: Number(values.delta),
      reason: values.reason?.trim() || undefined,
    });
    onClose();
  });

  return (
    <dialog
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-dialog-title"
      aria-describedby="bulk-dialog-desc"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 m-auto max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-md rounded-xl border border-hairline bg-card p-0 shadow-lg backdrop:bg-foreground/40 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 id="bulk-dialog-title" className="text-[18px] font-semibold leading-[1.3]">
          {title ?? "Điều chỉnh hàng loạt"}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
          aria-label="Đóng"
        >
          ✕
        </Button>
      </div>

      <p id="bulk-dialog-desc" className="px-6 pt-3 text-[14px] text-muted-foreground">
        Sẽ áp dụng cho {rows.length} sản phẩm đã chọn.
      </p>

      {sample && (
        <div className="mx-6 mt-4 flex items-center gap-3 rounded-xl border border-hairline bg-surface-container-high px-4 py-3">
          <div className="flex flex-1 flex-col items-center">
            <span className="text-xs text-muted-foreground">Hiện tại (mẫu)</span>
            <span className="text-lg font-bold tabular-nums">
              {sample.quantity.toLocaleString("vi-VN")}
            </span>
          </div>
          <span className="text-2xl font-light text-muted-foreground">+</span>
          <div className="flex flex-1 flex-col items-center">
            <span className="text-xs text-muted-foreground">Điều chỉnh</span>
            <span
              className={`text-lg font-bold tabular-nums ${
                Number(delta) > 0
                  ? "text-green-600"
                  : Number(delta) < 0
                    ? "text-red-600"
                    : "text-muted-foreground"
              }`}
            >
              {Number(delta) >= 0 ? "+" : ""}
              {Number(delta) || 0}
            </span>
          </div>
          <span className="text-2xl font-light text-muted-foreground">=</span>
          <div className="flex flex-1 flex-col items-center">
            <span className="text-xs text-muted-foreground">Mới (mẫu)</span>
            <span className="text-lg font-bold tabular-nums text-primary">
              {(sample.quantity + (Number(delta) || 0)).toLocaleString("vi-VN")}
            </span>
          </div>
        </div>
      )}

      <form noValidate onSubmit={onSubmit} className="space-y-4 px-6 py-4">
        <div className="space-y-1.5">
          <Label htmlFor="bulk-delta" className="text-[14px] font-medium">
            Số lượng điều chỉnh
            <span aria-hidden="true" className="ml-0.5 text-destructive">*</span>
          </Label>
          <Input
            id="bulk-delta"
            type="number"
            step={1}
            autoComplete="off"
            {...register("delta")}
            aria-invalid={Boolean(errors.delta)}
            disabled={mutation.isPending}
          />
          <p className="text-xs text-muted-foreground">
            Số dương để nhập kho, số âm để xuất kho.
          </p>
          {errors.delta && (
            <p role="alert" className="text-xs text-destructive">
              {errors.delta.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bulk-reason" className="text-[14px] font-medium">
            Lý do
            <span className="ml-1 text-xs font-normal text-muted-foreground">(không bắt buộc)</span>
          </Label>
          <Textarea
            id="bulk-reason"
            rows={2}
            placeholder="Nhập kho, kiểm hàng, hao hụt…"
            {...register("reason")}
            disabled={mutation.isPending}
          />
          {errors.reason && (
            <p role="alert" className="text-xs text-destructive">
              {errors.reason.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Huỷ
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending}
            aria-busy={mutation.isPending || undefined}
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            {confirmLabel ?? "Áp dụng"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
