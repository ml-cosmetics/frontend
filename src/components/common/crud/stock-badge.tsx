"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

/**
 * Thresholds that determine which stock status variant is shown.
 * Defaults mirror the brief's spec:
 *   In Stock  → quantity > 5
 *   Low Stock → 1 ≤ quantity ≤ 5
 *   Out of Stock → quantity === 0
 */
export interface StockThresholdConfig {
  low?: number;
  out?: number;
}

const DEFAULT_THRESHOLDS: StockThresholdConfig = {
  low: 5,
  out: 0,
};

/** The three stock status levels. */
/** The three stock status levels. */
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

function getStockStatus(quantity: number, thresholds: StockThresholdConfig = DEFAULT_THRESHOLDS): StockStatus {
  if (quantity <= (thresholds.out ?? 0)) return "out_of_stock";
  if (quantity <= (thresholds.low ?? 5)) return "low_stock";
  return "in_stock";
}

function getStatusLabel(status: StockStatus): string {
  switch (status) {
    case "in_stock": return "Còn hàng";
    case "low_stock": return "Sắp hết";
    case "out_of_stock": return "Hết hàng";
  }
}

const VARIANT_MAP: Record<StockStatus, "success" | "warning" | "destructive"> = {
  in_stock: "success",
  low_stock: "warning",
  out_of_stock: "destructive",
};

/**
 * `StockBadge` — shows the stock status for an inventory row.
 *
 * Uses shadcn/ui `Badge` with the `success` / `warning` / `destructive`
 * variants already defined in the design system. The colour thresholds
 * are configurable via `thresholds` so other features can reuse this
 * without being locked to the defaults.
 */
export interface StockBadgeProps {
  quantity: number;
  thresholds?: StockThresholdConfig;
  showQuantity?: boolean;
  className?: string;
}

export function StockBadge({
  quantity,
  thresholds,
  showQuantity = false,
  className,
}: StockBadgeProps) {
  const status = getStockStatus(quantity, thresholds ?? DEFAULT_THRESHOLDS);
  const label = showQuantity
    ? `${getStatusLabel(status)} · ${quantity}`
    : getStatusLabel(status);

  return (
    <Badge
      variant={VARIANT_MAP[status]}
      className={cn("rounded-full", className)}
    >
      {label}
    </Badge>
  );
}

/** Expose helpers so callers can build filters / sort logic. */
export { getStockStatus, getStatusLabel };
