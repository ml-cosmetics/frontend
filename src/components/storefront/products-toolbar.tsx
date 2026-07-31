"use client";

import * as React from "react";
import { KeyboardArrowDown, GridView, ViewList } from "@/components/layout/storefront-icons";
import { SortDropdown, type SortOption } from "@/components/common/sort-dropdown";
import { cn } from "@/lib/utils/cn";

/**
 * ProductsToolbar — sticky row of filter chips + sort selector +
 * grid/list view toggle. Pure presentational; the parent owns the
 * state and the on-change handlers.
 *
 * Visual treatment:
 *   - Filter chips: tinted glass pills (rose-50/80 backdrop) with a
 *     hairline border, gradient hover lift, chevron that rotates on
 *     hover to imply a dropdown.
 *   - Sort selector: pill with a subtle background, chevron + label
 *     styled as a single affordance.
 *   - View toggle: rounded segmented control with a sliding active
 *     indicator (gradient) — pill on touch, sharp on desktop.
 *   - Sticky bar: gradient bottom border + layered shadow so the bar
 *     reads as a "floating" command strip while scrolling.
 */
export interface FilterChipDefinition {
  key: string;
  label: string;
  open?: boolean;
}

export interface ProductsToolbarProps {
  filters: FilterChipDefinition[];
  sortValue: string;
  sortOptions: SortOption<string>[];
  viewMode: "grid" | "list";
  onFilterClick?: (key: string) => void;
  onSortChange?: (next: string) => void;
  onViewChange?: (next: "grid" | "list") => void;
  className?: string;
}

export function ProductsToolbar({
  filters,
  sortValue,
  sortOptions,
  viewMode,
  onFilterClick,
  onSortChange,
  onViewChange,
  className,
}: ProductsToolbarProps) {
  return (
    <div
      className={cn(
        "sticky top-20 z-40 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rose-100/70 bg-white/85 p-2 shadow-[0_4px_24px_-12px_rgba(225,29,116,0.15)] backdrop-blur-md",
        className,
      )}
    >
      <div className="flex flex-1 items-center gap-2 overflow-x-auto p-1 scrollbar-hide">
        {filters.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => onFilterClick?.(chip.key)}
            className="group inline-flex shrink-0 h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-rose-100/80 bg-white/70 px-4 text-sm font-medium leading-none text-zinc-700 shadow-[0_1px_2px_rgba(225,29,116,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-gradient-to-br hover:from-[#FFF1F7] hover:to-[#FCE7F3] hover:text-primary hover:shadow-[0_8px_20px_-8px_rgba(225,29,116,0.35)] active:translate-y-0"
          >
            <span>{chip.label}</span>
            <KeyboardArrowDown
              size={14}
              className="text-zinc-400 transition-all duration-300 group-hover:rotate-180 group-hover:text-primary"
            />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <SortDropdown
          value={sortValue}
          onChange={(next) => onSortChange?.(next)}
          options={sortOptions}
          placeholder="Sắp xếp"
          size="sm"
        />

        <div
          role="group"
          aria-label="Chế độ hiển thị"
          className="relative hidden overflow-hidden rounded-full border border-rose-100/80 bg-white/70 p-1 shadow-[0_1px_2px_rgba(225,29,116,0.04)] sm:flex"
        >
          <button
            type="button"
            aria-label="Chế độ lưới"
            aria-pressed={viewMode === "grid"}
            onClick={() => onViewChange?.("grid")}
            className={cn(
              "relative grid h-8 w-9 place-items-center rounded-full transition-colors duration-300",
              viewMode === "grid"
                ? "text-primary"
                : "text-zinc-400 hover:text-zinc-700",
            )}
          >
            {viewMode === "grid" && (
              <span
                aria-hidden
                className="absolute inset-0 -z-0 rounded-full bg-gradient-to-br from-[#FFF1F7] to-[#FCE7F3] shadow-[0_4px_12px_-4px_rgba(225,29,116,0.35)] transition-all duration-300"
              />
            )}
            <GridView size={18} className="relative z-10" />
          </button>
          <button
            type="button"
            aria-label="Chế độ danh sách"
            aria-pressed={viewMode === "list"}
            onClick={() => onViewChange?.("list")}
            className={cn(
              "relative grid h-8 w-9 place-items-center rounded-full transition-colors duration-300",
              viewMode === "list"
                ? "text-primary"
                : "text-zinc-400 hover:text-zinc-700",
            )}
          >
            {viewMode === "list" && (
              <span
                aria-hidden
                className="absolute inset-0 -z-0 rounded-full bg-gradient-to-br from-[#FFF1F7] to-[#FCE7F3] shadow-[0_4px_12px_-4px_rgba(225,29,116,0.35)] transition-all duration-300"
              />
            )}
            <ViewList size={18} className="relative z-10" />
          </button>
        </div>
      </div>
    </div>
  );
}

ProductsToolbar.displayName = "ProductsToolbar";
