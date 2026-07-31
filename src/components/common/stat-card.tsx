import * as React from "react";
import { ArrowDown, ArrowUp, type LucideIcon, Minus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * StatCard — single KPI tile used on dashboards.
 *
 * Aura Vénus styling (design MD):
 *   - 16 px radius, 1 px hairline border
 *   - 24 px padding
 *   - Label uppercase eyebrow (12 px / 600 / 0.05em)
 *   - Value uses headline-md (32 px / 600 / 1.3)
 *   - Optional icon bubble and delta indicator
 */
export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  /** Optional secondary line below the value (e.g. unit, comparison). */
  hint?: React.ReactNode;
  /** Percentage delta vs previous period. Positive = up, negative = down. */
  delta?: number;
  icon?: LucideIcon;
  /** Custom icon tint class (e.g. "text-primary"). Defaults to primary. */
  iconClassName?: string;
  loading?: boolean;
  className?: string;
}

function formatDelta(delta: number) {
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}%`;
}

export function StatCard({
  label,
  value,
  hint,
  delta,
  icon: Icon,
  iconClassName,
  loading,
  className,
}: StatCardProps) {
  const trend =
    delta === undefined
      ? null
      : delta > 0
        ? "up"
        : delta < 0
          ? "down"
          : "flat";
  const TrendIcon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus;
  const trendClass =
    trend === "up"
      ? "text-[var(--color-success)] bg-[var(--color-success-bg)]"
      : trend === "down"
        ? "text-destructive bg-[var(--color-warning-bg)]"
        : "text-muted-foreground bg-surface-container";

  return (
    <div
      className={cn(
        "rounded-xl border border-hairline bg-card p-6 transition-shadow hover:aura-shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
            {label}
          </p>
          {loading ? (
            <div className="h-7 w-24 animate-pulse rounded-md bg-surface-container-high" />
          ) : (
            <p className="text-[32px] font-semibold leading-[1.3] tracking-[-0.01em] text-foreground">
              {value}
            </p>
          )}
          {hint && !loading && (
            <p className="text-[12px] text-muted-foreground">{hint}</p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              iconClassName ?? "bg-primary/10 text-primary",
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </div>
        )}
      </div>
      {trend && !loading && (
        <div
          className={cn(
            "mt-4 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[12px] font-medium",
            trendClass,
          )}
        >
          <TrendIcon className="h-3 w-3" aria-hidden />
          {formatDelta(delta as number)}
        </div>
      )}
    </div>
  );
}
StatCard.displayName = "StatCard";
