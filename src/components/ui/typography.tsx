import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * ML Cosmetics typography primitives.
 *
 * Sizes come directly from the ML Cosmetics design MD (Stitch project
 * 52fd000b0dcd472b8ea0e863fced4d60 — Aura Rose Luxury Treatment).
 * Every variant is intentional — these are editorial-grade
 * display/headline/body/label roles, not generic text wrappers. Use
 * them in pages to keep typographic hierarchy consistent.
 *
 * Note: the form-label primitive is in `./label.tsx` (Radix Label).
 * Typography labels here are named `Label` by role but exported as
 * `Text` to avoid colliding with the Radix form `Label`.
 *
 * Each component accepts a `className` for one-off layout tweaks and
 * renders the correct semantic tag by default.
 */

const typographyBase = "font-sans text-foreground antialiased";

/* ---------------------- Display ---------------------- */

type DisplayLevel = "lg" | "sm";
const displayStyles: Record<DisplayLevel, string> = {
  lg: "text-[64px] font-bold leading-[1.1] tracking-[-0.04em]",
  sm: "text-[56px] font-bold leading-[1.1] tracking-[-0.03em]",
};

export interface DisplayProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: DisplayLevel;
  as?: "h1" | "h2" | "h3";
}

export const Display = React.forwardRef<HTMLHeadingElement, DisplayProps>(
  ({ className, level = "lg", as: Tag = "h1", ...props }, ref) => (
    <Tag
      ref={ref}
      className={cn(typographyBase, displayStyles[level], className)}
      {...props}
    />
  ),
);
Display.displayName = "Display";

/* ---------------------- Headline ---------------------- */

type HeadlineLevel = "lg" | "md" | "lg-mobile";
const headlineStyles: Record<HeadlineLevel, string> = {
  lg: "text-[40px] font-semibold leading-[1.2] tracking-[-0.02em]",
  md: "text-[32px] font-semibold leading-[1.3]",
  "lg-mobile": "text-[32px] font-semibold leading-[1.2]",
};

export interface HeadlineProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadlineLevel;
  as?: "h2" | "h3" | "h4";
}

export const Headline = React.forwardRef<HTMLHeadingElement, HeadlineProps>(
  ({ className, level = "lg", as: Tag = "h2", ...props }, ref) => (
    <Tag
      ref={ref}
      className={cn(typographyBase, headlineStyles[level], className)}
      {...props}
    />
  ),
);
Headline.displayName = "Headline";

/* ---------------------- Body ---------------------- */

type BodyLevel = "lg" | "md" | "sm";
const bodyStyles: Record<BodyLevel, string> = {
  lg: "text-[18px] font-normal leading-[1.6]",
  md: "text-[16px] font-normal leading-[1.6]",
  sm: "text-[14px] font-normal leading-[1.6]",
};

export interface BodyProps extends React.HTMLAttributes<HTMLParagraphElement> {
  level?: BodyLevel;
  as?: "p" | "span" | "div";
}

export const Body = React.forwardRef<HTMLParagraphElement, BodyProps>(
  ({ className, level = "md", as: Tag = "p", ...props }, ref) => (
    <Tag
      ref={ref}
      className={cn(typographyBase, bodyStyles[level], "text-foreground", className)}
      {...props}
    />
  ),
);
Body.displayName = "Body";

/* ---------------------- TextLabel ---------------------- *
 * Typography-level label (NOT a form label). Use it for short metadata,
 * tag text, eyebrow strings. For form labels use the Radix `Label` from
 * `./label.tsx`.
 * ----------------------------------------------------------------- */

type TextLabelLevel = "md" | "sm" | "caps";
const labelStyles: Record<TextLabelLevel, string> = {
  md: "text-[14px] font-medium leading-[1.4] tracking-[0.02em]",
  sm: "text-[12px] font-medium leading-[1.4] tracking-[0.02em]",
  caps: "text-[12px] font-semibold leading-[1] tracking-[0.05em] uppercase",
};

export interface TextLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  level?: TextLabelLevel;
  /** Visual tone. Defaults to inherited foreground color. */
  tone?: "default" | "muted" | "primary";
  /** Render as a different semantic element. */
  as?: "span" | "label" | "div";
}

export function TextLabel({
  className,
  level = "md",
  as: Tag = "span",
  tone = "default",
  ...props
}: TextLabelProps) {
  const toneClass =
    tone === "muted"
      ? "text-muted-foreground"
      : tone === "primary"
        ? "text-primary"
        : "text-foreground";
  return (
    <Tag
      className={cn(typographyBase, labelStyles[level], toneClass, className)}
      {...props}
    />
  );
}
TextLabel.displayName = "TextLabel";

/* ---------------------- Code ---------------------- */

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  as?: "code" | "pre";
}

export function Code({ className, as: Tag = "code", ...props }: CodeProps) {
  return (
    <Tag
      className={cn(
        "rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px] leading-[1.5] text-foreground",
        className,
      )}
      {...props}
    />
  );
}
Code.displayName = "Code";