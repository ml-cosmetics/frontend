"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateInventoryQuantity } from "../hooks/use-update-inventory-quantity";
import type { InventoryRow } from "./columns";

const adjustmentSchema = z.object({
  adjustment: z.coerce
    .number({
      required_error: "Số điều chỉnh là bắt buộc.",
      invalid_type_error: "Phải là một số.",
    })
    .int("Phải là số nguyên.")
    .refine(
      (n) => n !== 0,
      { message: "Số điều chỉnh không được bằng 0." },
    ),
  reason: z.string().max(500, "Lý do tối đa 500 ký tự.").optional(),
});

type AdjustmentFormValues = z.infer<typeof adjustmentSchema>;

/**
 * `AdjustmentDialog` — modal dialog for adjusting inventory quantity.
 *
 * Fields: Current Quantity (readonly), Adjustment (+/-), Reason (optional).
 *
 * Preview: Current + Adjustment = New Quantity (computed live).
 *
 * Submit: PUT /v1/inventories/:id with optimistic update via
 * `useUpdateInventoryQuantity`. The dialog closes on success.
 *
 * Accessibility: role="dialog", aria-labelledby, focus trap via
 * `<dialog>` element, Escape to close.
 */
export interface AdjustmentDialogProps {
  row: InventoryRow;
  onClose: () => void;
}

export function AdjustmentDialog({ row, onClose }: AdjustmentDialogProps) {
  const updateMutation = useUpdateInventoryQuantity();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const initialFocusRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState,
  } = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: { adjustment: 0, reason: "" },
    mode: "onSubmit",
  });

  const adjustment = watch("adjustment");
  const errors = formState.errors;

  // Computed preview values.
  const currentQty = row.quantity;
  const adj = typeof adjustment === "number" ? adjustment : Number(adjustment ?? 0);
  const newQty = currentQty + adj;
  const isValid = newQty >= 0;

  // Open the native <dialog> element on mount.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    initialFocusRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    dialog.addEventListener("keydown", handleKeyDown);
    return () => dialog.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Close on backdrop click.
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const handleFormSubmit = handleSubmit(async (values) => {
    if (!isValid || updateMutation.isPending) return;
    await updateMutation.mutateAsync({
      id: row.id,
      quantity: newQty,
      reason: values.reason?.trim() || undefined,
    });
    onClose();
  });

  return (
    <dialog
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="adjust-dialog-title"
      aria-describedby="adjust-dialog-desc"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 m-auto max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-md rounded-xl border border-hairline bg-card p-0 shadow-lg backdrop:bg-foreground/40 backdrop:backdrop-blur-[2px]"
    >
      {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 id="adjust-dialog-title" className="text-[18px] font-semibold leading-[1.3]">
            Cập nhật số lượng
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

        {/* Description */}
        <p
          id="adjust-dialog-desc"
          className="px-6 pt-3 text-[14px] text-muted-foreground"
        >
          {row.product?.name ?? row.product_id}
          {row.product?.id ? ` · ID: ${row.product.id.slice(0, 8)}` : ""}
        </p>

        {/* Preview */}
        <div className="mx-6 mt-4 flex items-center gap-3 rounded-xl border border-hairline bg-surface-container-high px-4 py-3">
          <div className="flex flex-1 flex-col items-center">
            <span className="text-xs text-muted-foreground">Hiện tại</span>
            <span className="text-lg font-bold tabular-nums">
              {currentQty.toLocaleString("vi-VN")}
            </span>
          </div>
          <span className="text-2xl font-light text-muted-foreground">+</span>
          <div className="flex flex-1 flex-col items-center">
            <span className="text-xs text-muted-foreground">Điều chỉnh</span>
            <span
              className={`text-lg font-bold tabular-nums ${
                adj > 0
                  ? "text-green-600"
                  : adj < 0
                    ? "text-red-600"
                    : "text-muted-foreground"
              }`}
            >
              {adj >= 0 ? "+" : ""}
              {adj}
            </span>
          </div>
          <span className="text-2xl font-light text-muted-foreground">=</span>
          <div className="flex flex-1 flex-col items-center">
            <span className="text-xs text-muted-foreground">Mới</span>
            <span
              className={`text-lg font-bold tabular-nums ${
                isValid ? "text-primary" : "text-destructive"
              }`}
            >
              {newQty >= 0 ? newQty.toLocaleString("vi-VN") : `? (${newQty})`}
            </span>
          </div>
        </div>

        {/* Validation warning */}
        {!isValid && (
          <p
            role="alert"
            className="mx-6 mt-2 text-xs text-destructive"
          >
            Số lượng mới không được nhỏ hơn 0.
          </p>
        )}

        {/* Form */}
        <form
          noValidate
          onSubmit={handleFormSubmit}
          className="space-y-4 px-6 py-4"
        >
          {/* Adjustment */}
          <div className="space-y-1.5">
            <Label htmlFor="adjustment" className="text-[14px] font-medium">
              Số điều chỉnh
              <span aria-hidden="true" className="ml-0.5 text-destructive">*</span>
            </Label>
            <Input
              id="adjustment"
              type="number"
              step={1}
              autoComplete="off"
              {...register("adjustment")}
              aria-invalid={Boolean(errors.adjustment)}
              disabled={updateMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Nhập số dương để thêm, số âm để bớt. Ví dụ: +10 hoặc -5.
            </p>
            {errors.adjustment && (
              <p role="alert" className="text-xs text-destructive">
                {errors.adjustment.message}
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <Label htmlFor="reason" className="text-[14px] font-medium">
              Lý do
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                (không bắt buộc)
              </span>
            </Label>
            <Textarea
              id="reason"
              rows={2}
              placeholder="Nhập kho, kiểm hàng, hao hụt…"
              {...register("reason")}
              disabled={updateMutation.isPending}
            />
            {errors.reason && (
              <p role="alert" className="text-xs text-destructive">
                {errors.reason.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={updateMutation.isPending}
            >
              Huỷ
            </Button>
            <Button
              type="submit"
              disabled={!isValid || updateMutation.isPending}
              aria-busy={updateMutation.isPending || undefined}
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              Lưu thay đổi
            </Button>
          </div>
        </form>
    </dialog>
  );
}
