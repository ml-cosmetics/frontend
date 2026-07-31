import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Container — fixed-width wrapper that centres content within the
 * Aura Vénus boutique layout (max-width 1280 px on desktop).
 *
 * Maps to the design MD `container-max` token. Use this in every
 * storefront section and every admin page header instead of raw
 * `<div className="mx-auto">` so layout stays consistent.
 */

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  /** When true, removes the horizontal padding. Useful for full-bleed
   *  sections inside the storefront. */
  fluid?: boolean;
}

const sizeMap = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-[1280px]",
  // Editorial spread for sections that need extra room (e.g. the
  // wishlist page where 4 large product cards need to breathe).
  "2xl": "max-w-[1536px]",
  full: "max-w-none",
};

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "xl", fluid, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mx-auto w-full px-4 md:px-8 lg:px-10 xl:px-12",
        sizeMap[size],
        fluid && "!px-0",
        className,
      )}
      {...props}
    />
  ),
);
Container.displayName = "Container";