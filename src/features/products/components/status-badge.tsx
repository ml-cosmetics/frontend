import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { ProductStatus } from "@/types";

/**
 * Status badge — translates a `ProductStatus` into a visual chip
 * matching the Aura Rose design tokens (active = primary pink,
 * draft = muted, archived = secondary slate).
 */
export interface StatusBadgeProps {
  status: ProductStatus;
  className?: string;
}

const LABELS: Record<ProductStatus, string> = {
  [ProductStatus.Active]: "Đang bán",
  [ProductStatus.Draft]: "Bản nháp",
  [ProductStatus.Archived]: "Đã ẩn",
};

const TONE_VARIANT: Record<ProductStatus, "primary" | "muted" | "secondary"> = {
  [ProductStatus.Active]: "primary",
  [ProductStatus.Draft]: "muted",
  [ProductStatus.Archived]: "secondary",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant={TONE_VARIANT[status]}
      className={cn("text-[12px] font-semibold uppercase leading-[1.4] tracking-[0.05em]", className)}
    >
      {LABELS[status] ?? status}
    </Badge>
  );
}
