"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { APIError } from "@/lib/api";

/**
 * Aura Vénus ErrorState — flat surface, 16 px radius, 1 px destructive
 * border, 48 px vertical padding. Icon bubble is 48 px circle.
 */
export interface ErrorStateProps {
  error?: unknown;
  title?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  error,
  title = "Đã xảy ra lỗi",
  onRetry,
  className,
}: ErrorStateProps) {
  let message = "Vui lòng thử lại sau.";
  if (error instanceof APIError) {
    message = error.message || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
      </div>
      <h3 className="text-[18px] font-semibold leading-[1.3] text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-[14px] leading-[1.6] text-muted-foreground">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-6">
          <RefreshCw className="mr-2 h-4 w-4" />
          Thử lại
        </Button>
      )}
    </div>
  );
}
