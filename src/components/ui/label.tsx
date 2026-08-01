"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Aura Vénus Label — label-md style (14 px / 500 / 0.02em).
 */
const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-[12px] font-semibold uppercase leading-[1] tracking-[0.05em] text-foreground",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  ),
);
Label.displayName = "Label";

export { Label };
