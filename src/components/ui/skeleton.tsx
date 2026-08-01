"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Aura Vénus Skeleton — 8 px radius, surface-container-high base so
 * the loader reads as a subtle background tint, not a hot muted
 * block. Used by loading states.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-surface-container-high",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
