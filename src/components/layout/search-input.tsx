"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

/**
 * Generic search input. Stateful via the controlled `value` /
 * `onChange` props. The "clear" button is shown when the field is
 * non-empty.
 *
 * Used as the building block for table filter inputs.
 */
export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  className?: string;
  placeholder?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { value, onChange, onClear, className, placeholder = "Tìm kiếm…", ...rest },
  ref,
) {
  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
        aria-label="Tìm kiếm"
        {...rest}
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            onChange("");
            onClear?.();
          }}
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          aria-label="Xoá nội dung tìm kiếm"
        >
          <Search className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
});

// GlobalSearchInput is re-exported from @/components/common/global-search-dialog
export { GlobalSearchDialog as GlobalSearchInput } from "@/components/common/global-search-dialog";
