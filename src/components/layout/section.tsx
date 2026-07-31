import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Section — vertical block with the Aura Vénus 64 px `stack-xl`
 * padding around it. Composes a `Container` so consumers only have to
 * worry about their own content.
 *
 * Background variants:
 *   - default: surface (off-white)
 *   - muted:   surface-container (slightly darker for separation)
 *   - primary: primary-tinted (CTA banner background)
 */

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Tone of the section background. */
  tone?: "default" | "muted" | "primary";
  /** Override vertical padding. Defaults to 64 px desktop / 48 px mobile. */
  spacing?: "sm" | "md" | "lg" | "xl";
  /** Removes top/bottom padding when the parent already provides it. */
  flush?: boolean;
  containerSize?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  children: React.ReactNode;
}

const spacingMap = {
  sm: "py-8 md:py-12",
  md: "py-12 md:py-16",
  lg: "py-16 md:py-20",
  xl: "py-20 md:py-24",
};

const toneMap = {
  default: "bg-surface text-foreground",
  muted: "bg-surface-container text-foreground",
  primary: "bg-primary text-primary-foreground",
};

import { Container } from "./container";

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    {
      className,
      tone = "default",
      spacing = "xl",
      flush,
      containerSize = "xl",
      children,
      ...props
    },
    ref,
  ) => (
    <section
      ref={ref}
      className={cn(
        toneMap[tone],
        !flush && spacingMap[spacing],
        className,
      )}
      {...props}
    >
      <Container size={containerSize}>{children}</Container>
    </section>
  ),
);
Section.displayName = "Section";