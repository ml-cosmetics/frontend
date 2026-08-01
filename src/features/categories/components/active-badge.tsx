"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import type { Category } from "@/types";

/**
 * `ActiveBadge` — translates `is_active` into a visual chip matching
 * the Aura Vénus design tokens.
 */
export interface ActiveBadgeProps {
  isActive: boolean;
  className?: string;
}

export function ActiveBadge({ isActive, className }: ActiveBadgeProps) {
  return (
    <Badge
      variant={isActive ? "success" : "muted"}
      className={cn("rounded-full", className)}
    >
      {isActive ? "Hiển thị" : "Ẩn"}
    </Badge>
  );
}

/** Row shape exposed to the table. */
export type CategoryListRow = Category;
