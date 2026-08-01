"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * `MonolithPage` — shared admin layout chrome. Provides:
 *
 *   - Page header (title + subtitle + right-side actions)
 *   - Optional KPI row
 *   - Optional tabs
 *   - Optional toolbar slot
 *   - Body slot (table, cards, etc.)
 *   - Built-in pagination footer
 *   - Optional right-rail slot
 *
 * Every page uses the light Aura Vénus palette from the parent
 * `(admin)` layout.
 */

export interface MonolithPageProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  kpis?: React.ReactNode;
  tabs?: React.ReactNode;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  rail?: React.ReactNode;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (p: number) => void;
  };
  className?: string;
}

export function MonolithPage({
  title,
  subtitle,
  actions,
  kpis,
  tabs,
  toolbar,
  children,
  rail,
  pagination,
  className,
}: MonolithPageProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[1400px] gap-6 p-6",
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-6">
        {(title || actions) && (
          <header className="flex items-start justify-between">
            <div>
              {title && (
                <h1 className="text-[36px] font-bold leading-[44px] tracking-[-0.04em] text-foreground">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex gap-3">{actions}</div>}
          </header>
        )}
        {kpis}
        {tabs}
        {toolbar}
        <div className="flex flex-col">{children}</div>
        {pagination && <Pagination {...pagination} />}
      </div>
      {rail && <div className="hidden w-[300px] flex-col gap-6 xl:flex">{rail}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Buttons (ghost / primary / danger)
 * ------------------------------------------------------------------ */
export function MonolithBtn({
  icon,
  label,
  tone = "ghost",
  onClick,
  disabled,
}: {
  icon?: React.ReactNode;
  label: string;
  tone?: "ghost" | "primary" | "danger";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const cls =
    tone === "primary"
      ? "rounded-[2px] bg-primary px-4 py-2 text-[13px] font-bold text-primary-foreground transition-colors hover:opacity-90"
      : tone === "danger"
      ? "rounded-[2px] border border-red-500/40 bg-transparent px-4 py-2 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50"
      : "flex items-center gap-2 rounded-[2px] border border-hairline bg-transparent px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-surface-container-low";
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cn(cls, disabled && "cursor-not-allowed opacity-50")}>
      {icon}
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * Pagination
 * ------------------------------------------------------------------ */
function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
}) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between rounded-[4px] border-t border-hairline bg-surface-container-low px-4 py-3 text-[13px]">
      <div className="text-muted-foreground">
        Hiển thị {start}-{end} của {total}
      </div>
      <div className="flex gap-1">
        <PageBtn disabled={page === 1} onClick={() => onPageChange(page - 1)} aria-label="Trang trước">
          <ChevronLeft className="h-[18px] w-[18px]" aria-hidden="true" />
        </PageBtn>
        {Array.from({ length: Math.min(lastPage, 4) }).map((_, i) => {
          const p = i + 1;
          return (
            <PageBtn key={p} active={p === page} onClick={() => onPageChange(p)}>
              {p}
            </PageBtn>
          );
        })}
        <PageBtn disabled={page === lastPage} onClick={() => onPageChange(page + 1)} aria-label="Trang sau">
          <ChevronRight className="h-[18px] w-[18px]" aria-hidden="true" />
        </PageBtn>
      </div>
    </div>
  );
}

function PageBtn({
  active,
  disabled,
  children,
  onClick,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      {...rest}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-[2px] font-mono text-[13px] transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "border border-transparent text-muted-foreground hover:bg-surface-container-low",
        disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * Reusable cell components
 * ------------------------------------------------------------------ */
export function MonolithTable({
  headers,
  children,
}: {
  headers: Array<{ key: string; label?: string; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[4px] border border-hairline bg-surface-container-lowest">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[13px] text-foreground">
          <thead>
            <tr className="bg-surface-container-low">
              {headers.map((h) => (
                <th
                  key={h.key}
                  scope="col"
                  className={cn("px-4 py-3 text-[13px] font-medium text-muted-foreground", h.className)}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function MonolithKpiCard({
  label,
  value,
  delta,
  icon,
}: {
  label: string;
  value: string | number;
  delta?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex h-[120px] flex-col justify-between rounded-[4px] border border-hairline bg-surface-container-lowest p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          {icon}
          {label}
        </div>
        {delta && <span className="text-[11px] font-medium text-emerald-600">{delta}</span>}
      </div>
      <div className="font-mono text-[28px] font-semibold text-foreground">{value}</div>
    </div>
  );
}
