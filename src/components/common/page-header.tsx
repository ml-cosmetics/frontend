import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Breadcrumb } from "./breadcrumb";

/**
 * PageHeader — title + optional description + right-aligned action
 * area. Always used at the top of a page so the in-page layout is
 * consistent.
 *
 * Aura Vénus styling (design MD):
 *   - 64 px desktop margin, 24 px mobile
 *   - 1 px hairline at the bottom
 *   - Title uses headline-md / 32 px / 600 / 1.3
 *   - Eyebrow uses label-caps (12 px / 600 / 0.05em / uppercase)
 *   - Description uses body-md (14 px / 400 / 1.6)
 */
export interface PageHeaderAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost";
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  showBreadcrumb?: boolean;
  className?: string;
  /** Eyebrow label shown above the title (e.g. "Quản lý"). */
  eyebrow?: string;
  /** Optional tab strip rendered between the title and the bottom border. */
  tabs?: React.ReactNode;
  /** Override labels keyed by path segment value (e.g. product ID →
   * product name). Forwarded to `Breadcrumb`. */
  breadcrumbOverrides?: Record<string, string>;
  /** If true, auto-built breadcrumb drops segments that have neither
   * an override nor a known label. Useful to hide dynamic IDs once a
   * friendly label has replaced them. */
  breadcrumbHideUnknown?: boolean;
}

export function PageHeader({
  title,
  description,
  actions,
  showBreadcrumb = true,
  className,
  eyebrow,
  tabs,
  breadcrumbOverrides,
  breadcrumbHideUnknown,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-hairline bg-card px-4 pb-6 pt-6 md:px-8",
        className,
      )}
    >
      {showBreadcrumb && (
        <Breadcrumb
          overrides={breadcrumbOverrides}
          hideUnknownSegments={breadcrumbHideUnknown}
        />
      )}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-2">
          {eyebrow && (
            <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <h1 className="text-[32px] font-semibold leading-[1.3] text-foreground">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-[14px] leading-[1.6] text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {tabs}
    </div>
  );
}
PageHeader.displayName = "PageHeader";
