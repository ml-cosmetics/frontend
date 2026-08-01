"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "@/components/layout/storefront-icons";
import { cn } from "@/lib/utils/cn";

/**
 * ProductsPagination — elegant pill-style pager for product grids.
 *
 * Design:
 *   - Page buttons scale + shadow-lift on hover; active page is a
 *     solid pink pill with a soft rose glow halo.
 *   - Prev/Next arrows slide in their direction on hover (icon slides
 *     2 px toward the navigation direction) so the affordance reads
 *     clearly.
 *   - All buttons have a 100 ms press-down (scale 0.92) on click via
 *     a `data-pressed` attribute toggled in JS — avoids double-tap
 *     zoom on touch and gives satisfying tactile feedback.
 *   - The whole row animates in (fade + translateY) on first mount.
 *   - The container has a top border fade-in on scroll-reveal.
 *
 * Accessibility:
 *   - `aria-current="page"` on the active button.
 *   - `aria-label` on every button ("Trang N", "Trang trước", "Trang sau").
 *   - Ellipsis `…` slots are non-interactive.
 *
 * Pagination range collapses through `buildRange` so long page counts
 * stay readable (e.g. `1 … 4 5 6 … 11`).
 */
export interface ProductsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  onPageChange: (next: number) => void;
  className?: string;
  /** Localized caption string. Defaults to the Stitch copy. */
  caption?: (from: number, to: number, total: number) => string;
}

function buildRange(current: number, total: number): (number | "…")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, "…", total];
  if (current >= total - 2) return [1, "…", total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

export function ProductsPagination({
  currentPage,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
  className,
  caption,
}: ProductsPaginationProps) {
  if (totalPages <= 0) return null;
  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, totalItems);
  const range = buildRange(currentPage, totalPages);
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const handleClick = (slot: number) => {
    onPageChange(slot);
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center border-t border-rose-100 px-6 pb-16 pt-8",
        className,
      )}
    >
      <span
        key={`caption-${from}-${to}`}
        className="mb-5 text-sm font-medium text-zinc-400 animate-fade-in"
      >
        {caption?.(from, to, totalItems) ??
          `Hiển thị ${from}–${to} · ${totalItems} sản phẩm`}
      </span>
      <div className="flex items-center gap-1.5">
        {/* Prev */}
        <ArrowButton
          label="Trang trước"
          icon={<ChevronLeft size={20} />}
          direction="prev"
          disabled={!canPrev}
          onClick={() => canPrev && onPageChange(currentPage - 1)}
        />

        {/* Page numbers */}
        {range.map((slot, idx) =>
          slot === "…" ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-10 w-10 items-center justify-center text-base font-medium text-zinc-300 select-none"
            >
              …
            </span>
          ) : (
            <PageButton
              key={slot}
              page={slot}
              isActive={slot === currentPage}
              delay={idx * 30}
              onClick={handleClick}
            />
          ),
        )}

        {/* Next */}
        <ArrowButton
          label="Trang sau"
          icon={<ChevronRight size={20} />}
          direction="next"
          disabled={!canNext}
          onClick={() => canNext && onPageChange(currentPage + 1)}
        />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Sub-components                                                          */
/* ---------------------------------------------------------------------- */

function PageButton({
  page,
  isActive,
  delay,
  onClick,
}: {
  page: number;
  isActive: boolean;
  delay: number;
  onClick: (p: number) => void;
}) {
  const [pressed, setPressed] = React.useState(false);

  return (
    <button
      type="button"
      aria-label={`Trang ${page}`}
      aria-current={isActive ? "page" : undefined}
      data-pressed={pressed || undefined}
      onClick={() => onClick(page)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{ animationDelay: `${delay}ms` }}
      className={cn(
        "relative h-10 min-w-[40px] cursor-pointer rounded-full text-sm font-semibold",
        "outline-none select-none",
        // Entrance animation
        "animate-slide-up-fade",
        // Base transition
        "transition-all duration-200 ease-out",
        // Active state
        isActive
          ? [
              // Solid pink fill with a layered glow ring
              "bg-primary text-white shadow-[0_2px_12px_-2px_rgba(225,29,116,0.45)]",
              "data-[pressed]:scale-[0.92]",
              "ring-[3px] ring-primary/20",
            ]
          : [
              // Default — clean white / light border
              "border border-zinc-200 bg-white text-zinc-500",
              // Hover — scale up, pink tint, shadow lift
              "hover:scale-110 hover:border-primary hover:bg-rose-50/80",
              "hover:text-primary hover:shadow-[0_4px_14px_-4px_rgba(225,29,116,0.30)]",
              // Press
              "data-[pressed]:scale-[0.90] data-[pressed]:shadow-none",
              "data-[pressed]:border-primary/40",
              // Focus
              "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
            ],
      )}
    >
      {page}
    </button>
  );
}

function ArrowButton({
  label,
  icon,
  direction,
  disabled,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const [pressed, setPressed] = React.useState(false);

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      data-pressed={pressed || undefined}
      data-direction={direction}
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      className={cn(
        "group relative grid h-10 w-10 cursor-pointer place-items-center rounded-full",
        "outline-none select-none",
        // Entrance animation
        "animate-fade-in",
        // Default
        disabled
          ? "cursor-not-allowed opacity-30"
          : [
              // Hover — pink circle fill fades in from the direction
              // the arrow points, icon slides 2 px outward
              "bg-transparent",
              "hover:bg-primary/10",
              "data-[direction='prev']:hover:bg-gradient-to-r",
              "data-[direction='next']:hover:bg-gradient-to-l",
              "hover:from-rose-50 hover:to-transparent",
            ],
        // Transition
        "transition-all duration-200 ease-out",
        // Press
        "data-[pressed]:scale-90",
      )}
    >
      <span
        className={cn(
          "transition-transform duration-200 ease-out",
          !disabled && [
            // Icon slides in navigation direction on hover
            "group-hover:translate-x-0.5",
            // Also color shifts to primary
            "text-zinc-400 group-hover:text-primary",
          ],
          disabled && "text-zinc-300",
          // On hover, prev icon moves left, next moves right
          direction === "prev" && !disabled && "group-hover:-translate-x-0.5",
          direction === "next" && !disabled && "group-hover:translate-x-0.5",
        )}
      >
        {icon}
      </span>
    </button>
  );
}

ProductsPagination.displayName = "ProductsPagination";