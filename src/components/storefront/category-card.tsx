import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Category } from "@/types";

/**
 * Category card for the storefront "Browse by collection" section.
 *
 * Stitch spec (Aura Vénus):
 *  - 16 px radius (`rounded-xl`)
 *  - 1 px border, surface-container-low background
 *  - Title: headline-md (32 px) semantic, kept smaller via `text-xl`
 *    for grid harmony
 *  - Count: label-caps, muted
 *  - Hover: border brightens to primary
 */
export interface CategoryCardProps {
  category: Category;
  productCount?: number;
  className?: string;
}

export function CategoryCard({ category, productCount, className }: CategoryCardProps) {
  const href = `/products?category=${encodeURIComponent(category.id)}`;

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-32 flex-col justify-between overflow-hidden rounded-xl border border-hairline bg-surface-container-low p-5 transition-colors",
        "hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      aria-label={`Khám phá danh mục ${category.name}`}
    >
      <span className="line-clamp-2 text-xl font-semibold tracking-tight text-foreground">
        {category.name}
      </span>
      <div className="flex items-center justify-between">
        {typeof productCount === "number" ? (
          <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
            {productCount} sản phẩm
          </span>
        ) : (
          <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
            Xem bộ sưu tập
          </span>
        )}
        <ChevronRight
          className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
