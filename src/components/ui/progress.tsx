"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Progress — Aura Vénus-styled progress bar.
 *
 * Native HTML `<progress>` styled to match the Aura Vénus spec: 8 px
 * tall, 12 px radius, primary purple fill on a muted surface track.
 * Smooth transition on value change.
 */

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "destructive";
}

const sizeStyles = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

const variantStyles = {
  default: "bg-primary",
  success: "bg-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]",
  destructive: "bg-destructive",
};

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, size = "md", variant = "default", ...props }, ref) => {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-surface-container",
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        <div
          className={cn("h-full transition-all duration-300", variantStyles[variant])}
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  },
);
Progress.displayName = "Progress";