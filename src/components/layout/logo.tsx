import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/**
 * Logo — Aura Vénus wordmark.
 *
 * Renders a serif-free monogram + "ML Cosmetics" text by default. The
 * size variants follow the type scale so the same Logo can be reused in
 * the sidebar, the topbar, the footer, and the auth page without
 * custom sizing.
 *
 * Pass `href` to make it a navigable link (renders via `next/link`).
 * Without `href` the Logo renders as a non-interactive `<div>` — this
 * means it can never produce a nested `<a>` when wrapped by a parent
 * link.
 */

export interface LogoProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "href"> {
  size?: "sm" | "md" | "lg";
  /** Optional brand label override. */
  label?: string;
  /** When provided, the logo renders as a `next/link` to this href. */
  href?: string;
  /** Custom image src (e.g. an SVG). When provided, the wordmark is
   *  replaced by the image. */
  src?: string;
  /** Hide the wordmark text and render only the monogram. */
  iconOnly?: boolean;
  /** Optional brand color override for the monogram. */
  tone?: "primary" | "foreground";
}

const sizeMap = {
  sm: { monogram: "h-6 w-6 text-[14px]", text: "text-[14px]" },
  md: { monogram: "h-8 w-8 text-[16px]", text: "text-[16px]" },
  lg: { monogram: "h-10 w-10 text-[20px]", text: "text-[18px]" },
};

export function Logo({
  className,
  size = "md",
  label = "ML Cosmetics",
  href,
  src,
  iconOnly,
  tone = "primary",
  ...props
}: LogoProps) {
  const toneClass = tone === "primary" ? "bg-primary text-primary-foreground" : "bg-foreground text-background";

  const inner = (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={label} className={sizeMap[size].monogram} />
      ) : (
        <span
          aria-hidden
          className={cn(
            "flex items-center justify-center rounded-lg font-bold tracking-tight",
            sizeMap[size].monogram,
            toneClass,
          )}
        >
          ML
        </span>
      )}
      {!iconOnly && (
        <span
          className={cn(
            "font-semibold tracking-tight text-foreground",
            sizeMap[size].text,
          )}
        >
          {label}
        </span>
      )}
    </div>
  );

  if (!href) return inner;

  return (
    <Link
      href={href}
      className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={props["aria-label"] ?? (iconOnly ? label : undefined)}
    >
      {inner}
    </Link>
  );
}
Logo.displayName = "Logo";