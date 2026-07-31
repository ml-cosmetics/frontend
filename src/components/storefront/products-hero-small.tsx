import * as React from "react";
import {
  Diamond,
  ShoppingCartCheckout,
  Star,
} from "@/components/layout/storefront-icons";
import { cn } from "@/lib/utils/cn";

/**
 * ProductsHeroSmall — Stitch editorial hero for category landing
 * pages. Centered, max-width 3xl, italic Playfair headline with a
 * primary-pink subline underneath, a muted description, and a single
 * frosted stats pill showing product / sales / rating counts.
 */
export interface ProductsHeroStat {
  icon: React.ReactNode;
  label: string;
}

export interface ProductsHeroSmallProps {
  title: string;
  /** Pink subline (Stitch: `— Đá quý ngàn năm —`). */
  subtitle?: string;
  description: string;
  stats: [ProductsHeroStat, ProductsHeroStat, ProductsHeroStat];
  /** Render the frosted stats pill. Defaults to true. Set to `false`
   *  to hide social-proof numbers (e.g. when the backend can't supply
   *  them yet). The title / subtitle / description always render. */
  showStats?: boolean;
  className?: string;
}

export function ProductsHeroSmall({
  title,
  subtitle,
  description,
  stats,
  showStats = true,
  className,
}: ProductsHeroSmallProps) {
  return (
    <div
      className={cn(
        "mx-auto mb-12 max-w-3xl text-center",
        className,
      )}
    >
      <h1 className="mb-4 font-headline text-4xl italic text-zinc-900 md:text-5xl">
        {title}
        {subtitle && (
          <span className="mt-2 block text-3xl not-italic text-primary">
            {subtitle}
          </span>
        )}
      </h1>
      <p className="mb-6 text-lg leading-relaxed text-zinc-600">
        {description}
      </p>
      {showStats && (
        <div className="inline-flex items-center justify-center gap-6 rounded-full border border-rose-50 bg-white/60 px-6 py-3 text-sm font-medium text-zinc-500 shadow-sm backdrop-blur-sm">
          {stats.map((stat, idx) => (
            <React.Fragment key={stat.label}>
              {idx > 0 && (
                <span aria-hidden className="h-1 w-1 rounded-full bg-zinc-300" />
              )}
              <span className="flex items-center gap-2">
                <span className="text-primary">{stat.icon}</span>
                {stat.label}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

ProductsHeroSmall.displayName = "ProductsHeroSmall";

/**
 * Build the three canonical stats from a backend `Pagination` payload.
 * Reused wherever a Stitch-style hero needs the frosted stats pill.
 */
export function defaultProductStats(
  total: number,
  sold: number,
  rating: number,
): [ProductsHeroStat, ProductsHeroStat, ProductsHeroStat] {
  return [
    { icon: <Diamond size={18} />, label: `${total} sản phẩm` },
    {
      icon: <ShoppingCartCheckout size={18} />,
      label: `Đã bán ${sold.toLocaleString("vi-VN")}`,
    },
    {
      icon: <Star size={18} filled />,
      label: `${rating.toFixed(1)}/5`,
    },
  ];
}