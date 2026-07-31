import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Aura Vénus Input — 12 px radius, 1 px hairline border, body-md text.
 *
 * On focus the border switches to primary purple and a 2 px outer glow
 * is rendered at 10 % opacity. Matches the design MD exactly.
 */
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-hairline bg-background px-3 py-2 text-[14px] leading-[1.6] text-foreground",
        "file:border-0 file:bg-transparent file:text-[14px] file:font-medium",
        "placeholder:text-muted-foreground",
        "transition-[border-color,box-shadow] duration-150",
        "hover:border-primary/40",
        "focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[0_0_0_2px_rgba(225,29,116,0.15)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
