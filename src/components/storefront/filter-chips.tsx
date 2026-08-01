"use client";

import * as React from "react";
import { Close, FilterAlt } from "@/components/layout/storefront-icons";
import { cn } from "@/lib/utils/cn";

/**
 * FilterChips — row of removable filter tags. Each chip is a soft
 * pink pill with a gradient fill, a leading label, and a trailing
 * × button that animates on hover.
 *
 * Renders the "Đang lọc: [chip] [chip] [chip] Xóa tất cả" pattern
 * used by the Stitch products list page.
 *
 * Visual treatment:
 *   - Header label uses a thin FilterAlt glyph + uppercase tracking
 *     for an editorial control-strip feel.
 *   - Active chip: gradient pink fill, soft ring shadow, white-ish
 *     border, smooth remove-button hover.
 *   - "Xóa tất cả" reads as a subtle rose link with underline-on-hover.
 */
export interface ActiveFilter {
  key: string;
  label: string;
}

export interface FilterChipsProps {
  filters: ActiveFilter[];
  onRemove?: (key: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export function FilterChips({
  filters,
  onRemove,
  onClearAll,
  className,
}: FilterChipsProps) {
  if (filters.length === 0 && !onClearAll) return null;

  return (
    <div
      className={cn(
        "mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-rose-100/70 bg-white/70 px-4 py-3 shadow-[0_2px_16px_-10px_rgba(225,29,116,0.18)] backdrop-blur-sm",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
        <FilterAlt
          size={14}
          className="text-primary/70"
          aria-hidden
        />
        Đang lọc
      </span>
      {filters.map((chip) => (
        <span
          key={chip.key}
          className="group inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-gradient-to-br from-[#FFF1F7] via-white to-[#FCE7F3] py-1.5 pl-3 pr-1.5 text-sm font-medium text-primary shadow-[0_2px_8px_-4px_rgba(225,29,116,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_18px_-8px_rgba(225,29,116,0.35)]"
        >
          {chip.label}
          <button
            type="button"
            aria-label={`Bỏ lọc ${chip.label}`}
            onClick={() => onRemove?.(chip.key)}
            className="grid h-5 w-5 place-items-center rounded-full bg-white/70 text-primary transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-white"
          >
            <Close size={12} />
          </button>
        </span>
      ))}
      {filters.length > 0 && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="ml-auto text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 transition-colors duration-300 hover:text-primary hover:underline"
        >
          Xóa tất cả
        </button>
      )}
    </div>
  );
}

FilterChips.displayName = "FilterChips";
