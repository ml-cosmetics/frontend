"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Aura Vénus RadioGroup — 16 × 16 px outlined circle, primary purple
 * fill when checked. Native inputs for full accessibility.
 */
interface RadioGroupContextValue {
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      className,
      name,
      value: controlledValue,
      defaultValue,
      onValueChange,
      disabled,
      orientation = "vertical",
      children,
      ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = React.useState<string | undefined>(defaultValue);
    const value = controlledValue ?? internal;

    const ctx = React.useMemo<RadioGroupContextValue>(
      () => ({
        name,
        value,
        onChange: (next: string) => {
          if (controlledValue === undefined) setInternal(next);
          onValueChange?.(next);
        },
        disabled,
      }),
      [name, value, onValueChange, controlledValue, disabled],
    );

    return (
      <RadioGroupContext.Provider value={ctx}>
        <div
          ref={ref}
          role="radiogroup"
          aria-orientation={orientation}
          className={cn(
            orientation === "horizontal" ? "flex flex-row gap-4" : "flex flex-col gap-3",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  },
);
RadioGroup.displayName = "RadioGroup";

export interface RadioGroupItemProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  value: string;
  label?: React.ReactNode;
}

export const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, label, id, disabled, ...props }, ref) => {
    const ctx = React.useContext(RadioGroupContext);
    const generatedId = React.useId();
    const itemId = id ?? generatedId;
    const checked = ctx?.value === value;

    return (
      <div className="flex items-center gap-2">
        <span className="relative inline-flex h-4 w-4 items-center justify-center">
          <input
            ref={ref}
            id={itemId}
            type="radio"
            name={ctx?.name}
            value={value}
            checked={checked}
            disabled={disabled || ctx?.disabled}
            onChange={() => ctx?.onChange?.(value)}
            className={cn(
              "peer absolute inset-0 h-4 w-4 cursor-pointer appearance-none rounded-full border border-hairline bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              "checked:border-primary",
              className,
            )}
            {...props}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute h-2 w-2 rounded-full bg-primary opacity-0 transition-opacity peer-checked:opacity-100"
          />
        </span>
        {label !== undefined && (
          <label
            htmlFor={itemId}
            className="cursor-pointer text-[14px] leading-[1.6] text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);
RadioGroupItem.displayName = "RadioGroupItem";
