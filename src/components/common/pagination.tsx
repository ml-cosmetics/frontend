"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, paginationRange } from "@/lib/utils";
import type { Pagination as PaginationData } from "@/types";

/**
 * Pagination component — single source of truth for every page that
 * paginates a list (storefront search, products, wishlist, orders,
 * admin tables, etc.).
 *
 * Two visual variants:
 *   - `storefront` (default) — Aura Rose vibe: hairline + soft shadow,
 *     primary accent on the active page, gradient backdrop. Used on
 *     any public-facing route.
 *   - `admin` — Monolith neutral: surface-container background, ink
 *     icons. Used inside `/admin/*` and `/operator/*`.
 *
 * Caller contract:
 *   - `pagination` is the backend block (`page`, `limit`, `offset`,
 *     `total`, `total_pages`, `has_previous`, `has_next`).
 *   - `onPageChange(page)` is the ONLY way to advance / rewind.
 *   - `onPerPageChange(perPage)` is optional; omit to hide the per-page
 *     picker (e.g. on the storefront where the page size is fixed by
 *     the route's filter contract).
 *
 * When `total_pages <= 7` the component renders compact numeric
 * buttons; beyond that it falls back to the prev/next + first/last
 * chevron set so the footer fits inside a single row.
 */

export type PaginationVariant = "storefront" | "admin";

export interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  /** Adjust items per page. Hides when omitted. */
  onPerPageChange?: (perPage: number) => void;
  /** Hide the "X–Y of Z" caption. */
  hideCaption?: boolean;
  /** Visual variant. Defaults to `storefront`. */
  variant?: PaginationVariant;
  className?: string;
}

const PER_PAGE_OPTIONS = [10, 20, 50, 100] as const;

const NUMERIC_THRESHOLD = 7;

/**
 * Build the slice of page numbers to render between the prev/next
 * chevrons. E.g. total=20, current=8 → [1, "…", 6, 7, 8, 9, 10, "…", 20].
 */
function buildPageItems(
  current: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= NUMERIC_THRESHOLD) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: Array<number | "ellipsis"> = [];
  const window = 1;

  items.push(1);
  if (current - window > 2) items.push("ellipsis");

  const start = Math.max(2, current - window);
  const end = Math.min(totalPages - 1, current + window);
  for (let i = start; i <= end; i++) items.push(i);

  if (current + window < totalPages - 1) items.push("ellipsis");
  if (totalPages > 1) items.push(totalPages);

  return items;
}

const containerBase =
  "flex flex-col items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-[14px] leading-[1.6] sm:flex-row sm:items-center";

const variantContainer: Record<PaginationVariant, string> = {
  storefront:
    "border-rose-100 bg-gradient-to-r from-[#FFF1F7]/80 via-white to-[#FCE7F3]/80 shadow-[0_4px_20px_-8px_rgba(225,29,116,0.15)] backdrop-blur",
  admin: "border-hairline bg-surface-container",
};

const variantChip: Record<PaginationVariant, { idle: string; active: string }> = {
  storefront: {
    idle: "border-rose-100 bg-white text-zinc-600 hover:border-primary hover:text-primary",
    active: "border-primary bg-primary text-primary-foreground shadow-sm",
  },
  admin: {
    idle: "border-hairline bg-card text-foreground hover:border-primary hover:text-primary",
    active: "border-primary bg-primary text-primary-foreground",
  },
};

export function Pagination({
  pagination,
  onPageChange,
  onPerPageChange,
  hideCaption,
  variant = "storefront",
  className,
}: PaginationProps) {
  const { from, to } = paginationRange(pagination);
  const canPrev = pagination.has_previous;
  const canNext = pagination.has_next;
  const totalPages = pagination.total_pages || 1;
  const pageItems = buildPageItems(pagination.page, totalPages);
  const chipStyles = variantChip[variant];

  return (
    <div
      className={cn(containerBase, variantContainer[variant], className)}
    >
      {!hideCaption && (
        <p className="text-[14px] leading-[1.6] text-muted-foreground">
          {pagination.total
            ? `Hiển thị ${from}–${to} của ${pagination.total}`
            : "Không có kết quả"}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {onPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-[14px] leading-[1.6] text-muted-foreground">
              Số mục / trang
            </span>
            <Select
              value={String(pagination.limit)}
              onValueChange={(value) => onPerPageChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[72px]" aria-label="Số mục mỗi trang">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PER_PAGE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(1)}
            disabled={!canPrev}
            aria-label="Trang đầu"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!canPrev}
            aria-label="Trang trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Numeric page chips — visible when total is small enough to
              render without overflow. */}
          <div className="mx-1 hidden items-center gap-1 sm:flex">
            {pageItems.map((item, idx) => {
              if (item === "ellipsis") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="inline-flex h-8 w-8 items-center justify-center text-[14px] text-muted-foreground"
                    aria-hidden
                  >
                    …
                  </span>
                );
              }
              const isActive = item === pagination.page;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onPageChange(item)}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`Trang ${item}`}
                  className={cn(
                    "inline-flex h-8 min-w-8 items-center justify-center rounded-full border px-2 text-[13px] font-medium transition-colors",
                    isActive ? chipStyles.active : chipStyles.idle,
                  )}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {/* Compact fallback — only "X / Y" pill on very small screens. */}
          <span className="mx-1 inline-flex h-8 items-center rounded-full border border-rose-100 bg-white px-3 text-[13px] font-medium text-foreground sm:hidden">
            Trang {pagination.page} / {totalPages}
          </span>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!canNext}
            aria-label="Trang sau"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(totalPages)}
            disabled={!canNext}
            aria-label="Trang cuối"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
