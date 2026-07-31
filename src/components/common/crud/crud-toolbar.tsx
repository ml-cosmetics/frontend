"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ErrorState } from "../error-state";

/**
 * Generic 350 ms debounced value hook. Reused by both products and
 * categories filter bars; lives in the shared CRUD layer so other
 * list pages can adopt it without pulling from a feature module.
 */
export interface UseDebouncedValueArgs<T> {
  defaultValue: T;
  delay?: number;
  onCommit: (value: T) => void;
}

export function useDebouncedValue<T>({
  defaultValue,
  delay = 350,
  onCommit,
}: UseDebouncedValueArgs<T>) {
  const [value, setValue] = React.useState<T>(defaultValue);
  const onCommitRef = React.useRef(onCommit);
  onCommitRef.current = onCommit;

  React.useEffect(() => {
    if (Object.is(value, defaultValue)) return;
    const id = window.setTimeout(() => onCommitRef.current(value), delay);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay]);

  return [value, setValue] as const;
}

/* ------------------------------------------------------------------ *
 * CrudFilterBar — the top toolbar shared by every list page.
 *
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │ [search…] [status filter] [refresh]            [primary CTA] │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * Each list page provides the filter controls (left) and the
 * primary CTA (right); everything else stays identical.
 * ------------------------------------------------------------------ */
export interface CrudFilterBarProps {
  /** Left-side filter controls (search input, status select, etc). */
  filters: React.ReactNode;
  /** Right-side action (e.g. "Thêm sản phẩm"). */
  actions?: React.ReactNode;
  className?: string;
}

export function CrudFilterBar({ filters, actions, className }: CrudFilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-hairline bg-card p-4 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
        {filters}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * CrudListShell — wrapper around loading / error / data.
 * ------------------------------------------------------------------ */
export interface CrudListShellProps {
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry?: () => void;
  className?: string;
  emptyState?: React.ReactNode;
  children: React.ReactNode;
}

export function CrudListShell({
  isLoading,
  isError,
  error,
  onRetry,
  className,
  emptyState,
  children,
}: CrudListShellProps) {
  if (isError) {
    return <ErrorState error={error} onRetry={onRetry} className={className} />;
  }
  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Đang tải"
        className={cn(
          "grid place-items-center rounded-xl border border-hairline bg-card py-16",
          className,
        )}
      >
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }
  if (emptyState) {
    return <div className={cn(className)}>{emptyState}</div>;
  }
  return <>{children}</>;
}
