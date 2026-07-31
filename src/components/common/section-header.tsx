import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * SectionHeader — heading + optional description + optional actions for
 * a single section of a page. Renders below the PageHeader.
 *
 * Aura Vénus spec: title uses headline-md (32 px / 600 / 1.3),
 * description uses body-md (14 px / 400 / 1.6), eyebrow uses
 * label-caps (12 px / 600 / 0.05em / uppercase / primary).
 */
export interface SectionHeaderProps {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  /** Optional eyebrow label rendered above the title. */
  eyebrow?: string;
}

export function SectionHeader({
  title,
  description,
  actions,
  align = "left",
  className,
  eyebrow,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-between gap-3 md:flex-row md:items-end",
        align === "center" && "md:flex-col md:items-center md:text-center",
        className,
      )}
    >
      <div className="space-y-1">
        {eyebrow && (
          <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-primary">
            {eyebrow}
          </p>
        )}
        <h2 className="text-[18px] font-semibold leading-[1.3] text-foreground">
          {title}
        </h2>
        {description && (
          <p className="max-w-2xl text-[14px] leading-[1.6] text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
SectionHeader.displayName = "SectionHeader";
