"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Full-screen blocking overlay. Used when a critical mutation is
 * in-flight (e.g. submitting an order) and we want to prevent the
 * user from triggering further actions.
 */
export interface LoadingOverlayProps {
  open: boolean;
  label?: string;
  className?: string;
}

export function LoadingOverlay({ open, label = "Đang xử lý…", className }: LoadingOverlayProps) {
  if (!open) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3 rounded-xl border border-hairline bg-card p-6 aura-shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[14px] font-medium leading-[1.6] text-foreground">{label}</p>
      </div>
    </div>
  );
}

/**
 * Inline loading spinner. Used as a button prefix (`<Button><Spinner/>…`)
 * or at the start of a row.
 */
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} aria-label="Đang tải" />;
}
