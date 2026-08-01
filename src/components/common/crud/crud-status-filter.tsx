"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

/**
 * `Option` — one toggle button in the filter bar.
 */
export interface CrudStatusFilterOption<T> {
  value: T;
  /** Accepts a plain string or any ReactNode (e.g. a StatusBadge + label). */
  label: React.ReactNode;
  /** Optional count badge shown beside the label. */
  count?: number;
}

/**
 * `CrudStatusFilterProps` — generic button-toggle status filter used at the
 * top of every list page (products, categories, inventory, etc.).
 *
 * Mirrors the design language from the Stitch LuxeOps screen where
 * status filters are pill-style toggle buttons, not a `<select>` dropdown.
 * This variant is simpler and more accessible than a combobox because
 * each option is immediately visible.
 *
 * Usage:
 * ```tsx
 * <CrudStatusFilter
 *   value={status}
 *   onChange={setStatus}
 *   options={[
 *     { value: undefined, label: "Tất cả" },
 *     { value: "in_stock", label: "Còn hàng" },
 *     { value: "low_stock", label: "Sắp hết" },
 *     { value: "out_of_stock", label: "Hết hàng" },
 *   ]}
 * />
 * ```
 */
export interface CrudStatusFilterProps<T> {
  value: T | undefined;
  onChange: (next: T | undefined) => void;
  options: CrudStatusFilterOption<T | undefined>[];
  /** Aria-label for the whole filter group. */
  label?: string;
  className?: string;
}

export function CrudStatusFilter<T>({
  value,
  onChange,
  options,
  label = "Lọc theo trạng thái",
}: CrudStatusFilterProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex flex-wrap items-center gap-2"
    >
      {options.map((opt) => {
        const isActive =
          opt.value === undefined ? value === undefined : opt.value === value;
        return (
          <Button
            key={String(opt.value ?? "__all__")}
            type="button"
            size="sm"
            variant={isActive ? "default" : "outline"}
            onClick={() => onChange(opt.value)}
            aria-pressed={isActive}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                {opt.count}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
