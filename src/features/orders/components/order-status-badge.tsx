"use client";

import * as React from "react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import type { OrderStatus } from "@/types";

/**
 * Order status badge — Aura Vénus light-tinted chip.
 *
 * Each status maps to a soft background + matching accent text so
 * the row scans at a glance without the previous "dark on dark"
 * dark-mode palette clashing with the admin's light skin. The
 * leading dot is dropped: the tinted background already carries
 * the colour signal, and two competing cues (dot + chip) was
 * noisy.
 */

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  created: "Chờ xác nhận",
  shipping: "Đang giao",
  done: "Hoàn thành",
  cancelled: "Đã huỷ",
};

// Map each status to the closest Aura Vénus Badge variant. We
// keep the mapping in one place so a new status (e.g. refunded)
// only needs to add a variant here.
const STATUS_VARIANT: Record<
  OrderStatus,
  NonNullable<BadgeProps["variant"]>
> = {
  created: "warning",
  shipping: "info",
  done: "success",
  cancelled: "danger",
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const variant = STATUS_VARIANT[status] ?? "muted";
  const label = STATUS_LABELS[status] ?? status;
  return (
    <Badge
      variant={variant}
      className={cn(
        "px-2 py-0.5 text-[12px] font-medium leading-[1.4] tracking-[0.01em]",
        "border-transparent",
        className,
      )}
    >
      {label}
    </Badge>
  );
}
