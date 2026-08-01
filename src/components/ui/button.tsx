import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

/**
 * Aura Rose Button — the canonical Stitch variants for the public
 * storefront (route group `(public)`).
 *
 * Spec source: Aura Rose design MD (Stitch project 52fd000b0dcd472b8ea0e863fced4d60).
 * The public surface always renders against `--color-primary: #e11d74`
 * (Aura Rose Luxury Treatment), so the default variant fills with
 * primary token and light surfaces are shared by the storefront,
 * admin, and operator routes.
 *
 * Sizes:
 *   - default: 40 px tall, 16 px horizontal padding (label-md / 14 px / 500).
 *   - sm:      32 px tall, 12 px horizontal padding.
 *   - lg:      44 px tall, 24 px horizontal padding.
 *   - icon:    40 × 40 px square.
 *
 * Variants:
 *   - default:  primary fill, white text, 12 px radius.
 *   - outline:  transparent fill, 1 px hairline border, dark text.
 *   - ghost:    no fill, no border, primary text.
 *   - secondary: muted slate fill (used in surface-stack contexts).
 *   - destructive: error red — used for delete confirmations.
 *   - link:     text-only, primary, underline on hover.
 */
const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg",
    "font-medium tracking-[0.02em] leading-none",
    "transition-[background-color,border-color,box-shadow,color,opacity,transform] duration-150 ease-out",
    "hover:-translate-y-0.5 hover:shadow-md",
    "active:translate-y-0 active:scale-[0.96]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    "select-none",
  ),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground aura-shadow-sm hover:opacity-90 hover:shadow-primary/30 active:opacity-80",
        outline:
          "border border-hairline bg-transparent text-foreground hover:bg-rose-50 hover:text-primary hover:border-rose-300",
        ghost: "bg-transparent text-primary hover:bg-primary/10",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 text-[14px]",
        sm: "h-8 rounded-lg px-3 text-[14px]",
        lg: "h-11 px-6 text-[14px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
