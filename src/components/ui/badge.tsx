import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

/**
 * Aura Vénus Badge — pill-shaped chips used for status, category, and
 * metadata. The default chip uses the Aura Rose primary fill; the
 * `primary` variant uses the pink-50 background with primary text.
 */
const badgeVariants = cva(
  cn(
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5",
    "text-[12px] font-medium leading-[1.4] tracking-[0.02em]",
    "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  ),
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        primary:
          "border-transparent bg-[#fce7f3] text-primary",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-hairline text-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        success:
          "border-transparent bg-[var(--color-success-bg)] text-[var(--color-success)]",
        warning:
          "border-transparent bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
        // Light tinted red chip — pairs with the
        // `--color-error-container` / `--color-on-error-container`
        // tokens used elsewhere. Safer for table rows than the
        // solid `destructive` variant (which dominates the eye).
        danger:
          "border-transparent bg-[var(--color-error-container)] text-[var(--color-on-error-container)]",
        // Light tinted blue chip — for "in progress" / neutral
        // informational states that aren't warnings.
        info:
          "border-transparent bg-[#e0f2fe] text-[#075985]",
        muted:
          "border-transparent bg-surface-container text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
