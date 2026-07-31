import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * IconActionCard — canonical "icon-circle + label + supporting copy"
 * card used across the Aura Rose public storefront.
 *
 * Single source of truth for the pattern that previously lived inline
 * as 4 near-identical components:
 *
 *   - frontend/src/app/(public)/contact/page.tsx      `ContactCard`
 *   - frontend/src/app/(public)/faq/page.tsx         `ContactTile`
 *   - frontend/src/app/(public)/promotions/page.tsx  `TrustCard`
 *   - frontend/src/app/(public)/reviews/page.tsx     `TrustBadge`
 *
 * When `href` is provided the card renders as an `<a>`; otherwise it
 * renders as a static `<div>`. Visual style — soft surface card,
 * hairline border, primary-tinted icon well — is inherited from
 * the Homepage canonical design system (Stitch project
 * 52fd000b0dcd472b8ea0e863fced4d60).
 */

interface IconActionCardProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  href?: string;
  /** Extra content (e.g. action link, secondary label) rendered
   *  below `description`. */
  footer?: React.ReactNode;
  /** Render a more compact tile (used for `TrustBadge`-style
   *  inline metrics). */
  compact?: boolean;
  className?: string;
}

export function IconActionCard({
  icon,
  title,
  description,
  href,
  footer,
  compact = false,
  className,
}: IconActionCardProps) {
  const classes = cn(
    "group flex flex-col gap-2 rounded-xl border border-hairline bg-card transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    href && "hover:border-primary",
    compact ? "p-3" : "p-5 md:p-6",
    className,
  );

  const iconWellClasses = cn(
    "grid place-items-center rounded-full bg-primary/10 text-primary",
    compact ? "h-8 w-8" : "h-10 w-10",
  );

  const content = (
    <>
      <span className={iconWellClasses} aria-hidden="true">
        {icon}
      </span>
      <p
        className={cn(
          "font-semibold text-foreground",
          compact ? "text-[12px] leading-tight" : "text-[15px]",
        )}
      >
        {title}
      </p>
      {description && !compact && (
        <p className="text-[14px] leading-[1.6] text-muted-foreground">
          {description}
        </p>
      )}
      {footer && !compact && <div className="mt-auto pt-1">{footer}</div>}
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  return <div className={classes}>{content}</div>;
}

IconActionCard.displayName = "IconActionCard";
