"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Aura Vénus SearchInput — 12 px radius, 1 px hairline, leading search
 * icon, optional trailing clear button.
 */
export interface SearchInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "defaultValue" | "onSubmit"
  > {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  showClear?: boolean;
  containerClassName?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      containerClassName,
      value: controlled,
      defaultValue,
      onValueChange,
      onSubmit,
      onKeyDown,
      showClear = true,
      disabled,
      placeholder = "Tìm kiếm…",
      ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = React.useState<string>(defaultValue ?? "");
    const value = controlled ?? internal;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      if (controlled === undefined) setInternal(next);
      onValueChange?.(next);
    };

    const handleClear = () => {
      if (controlled === undefined) setInternal("");
      onValueChange?.("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") onSubmit?.(value);
      onKeyDown?.(e);
    };

    return (
      <div
        className={cn(
          "relative flex h-10 w-full items-center rounded-lg border border-hairline bg-background text-[14px] transition-colors",
          "hover:border-primary/40",
          "focus-within:border-primary focus-within:shadow-[0_0_0_2px_rgba(225,29,116,0.15)]",
          disabled && "cursor-not-allowed opacity-60",
          containerClassName,
        )}
      >
        <Search
          className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground"
          aria-hidden
        />
        <input
          ref={ref}
          type="search"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "h-full w-full bg-transparent pl-9 pr-9 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed",
            className,
          )}
          {...props}
        />
        {showClear && value && (
          <button
            type="button"
            aria-label="Xóa"
            onClick={handleClear}
            className="absolute right-2 inline-flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";
