import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "@/components/layout/storefront-icons";
import { cn } from "@/lib/utils/cn";

/**
 * Breadcrumb — small public storefront trail used between the
 * header and the page hero. Renders an `<ol>` with chevron separators.
 *
 * Used by:
 *  - `/products`        — Trang chủ → Bộ sưu tập → …
 *  - `/products/[slug]` — Trang chủ → Vòng tay → Sản phẩm
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex text-sm text-zinc-500", className)}
    >
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li
              key={`${item.label}-${idx}`}
              className="inline-flex items-center"
              aria-current={isLast ? "page" : undefined}
            >
              {isLast || !item.href ? (
                <span className="font-medium text-zinc-800">{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              )}
              {!isLast && (
                <ChevronRight
                  size={16}
                  className="mx-1 text-zinc-400"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

Breadcrumb.displayName = "Breadcrumb";