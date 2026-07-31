"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Aura Vénus Switch — pill-shaped, 24 px tall × 44 px wide, primary
 * purple track when on, surface-container track when off. Knob
 * 20 × 20 px with subtle shadow.
 */
export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ checked: controlled, defaultChecked, onCheckedChange, disabled, ...props }, ref) => {
    const [internal, setInternal] = React.useState<boolean>(Boolean(defaultChecked));
    const checked = controlled ?? internal;

    return (
      <span
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
          "transition-colors duration-150",
          checked ? "bg-primary" : "bg-surface-container-high",
          disabled && "cursor-not-allowed opacity-50",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          disabled={disabled}
          onChange={(e) => {
            if (controlled === undefined) setInternal(e.target.checked);
            onCheckedChange?.(e.target.checked);
          }}
          className="peer absolute inset-0 cursor-pointer appearance-none focus:outline-none disabled:cursor-not-allowed"
          {...props}
        />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-sm ring-0 transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </span>
    );
  },
);
Switch.displayName = "Switch";
