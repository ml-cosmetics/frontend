"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";

/**
 * SortDropdown — reusable dropdown used by every list page that
 * paginates / sorts products or orders. Backed by the Aura Vénus
 * `Select` so the trigger + panel share the same Aura Rose look
 * across storefront and admin shells.
 *
 *   <SortDropdown
 *     value={sort}
 *     onChange={setSort}
 *     options={[
 *       { value: "default", label: "Mặc định" },
 *       { value: "price-asc", label: "Giá: Thấp đến Cao" },
 *     ]}
 *     placeholder="Sắp xếp"
 *     size="sm"
 *   />
 *
 * The trigger renders a small uppercase eyebrow label + the current
 * value, mirroring the visual pattern of the products toolbar so any
 * page that drops it in looks like part of the same family.
 */

export interface SortOption<V extends string = string> {
  value: V;
  label: string;
}

export interface SortDropdownProps<V extends string = string> {
  value: V;
  onChange: (next: V) => void;
  options: ReadonlyArray<SortOption<V>>;
  /** Eyebrow label on the left of the trigger. */
  placeholder?: string;
  /** `sm` for compact toolbars, `md` for standalone. */
  size?: "sm" | "md";
  /** When true, drop the eyebrow label so the trigger is value-only. */
  hideLabel?: boolean;
  className?: string;
  /** Accessible label for screen readers. Defaults to `placeholder`. */
  ariaLabel?: string;
}

export function SortDropdown<V extends string = string>({
  value,
  onChange,
  options,
  placeholder = "Sắp xếp",
  size = "sm",
  hideLabel = false,
  className,
  ariaLabel,
}: SortDropdownProps<V>) {
  const active = options.find((opt) => opt.value === value);

  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as V)}
    >
      <SelectTrigger
        size={size}
        aria-label={ariaLabel ?? placeholder}
        className={cn(
          "rounded-full shrink-0",
          hideLabel ? "w-[140px] min-w-0" : "w-[200px] min-w-0",
          className,
        )}
      >
        {hideLabel ? (
          <SelectValue placeholder={placeholder}>
            <span className="line-clamp-1 max-w-[120px] truncate leading-none">{active?.label}</span>
          </SelectValue>
        ) : (
          <span className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 group-data-[state=open]/trigger:text-primary leading-none">
              {placeholder}
            </span>
            <span className="line-clamp-1 max-w-[120px] truncate text-sm font-semibold text-zinc-800 group-data-[state=open]/trigger:text-primary leading-none">
              {active?.label ?? placeholder}
            </span>
          </span>
        )}
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

SortDropdown.displayName = "SortDropdown";
