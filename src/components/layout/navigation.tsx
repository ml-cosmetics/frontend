"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

/**
 * Navigation — sticky top navigation for the storefront (replaces the
 * placeholder nav currently inside PublicShell).
 *
 * Matches the Aura Vénus design MD:
 *   - Sticky at the top, 1 px hairline border, subtle backdrop blur.
 *   - Container max 1280 px.
 *   - Links use `label-md` (Medium weight, 14 px, +0.02em letter-spacing).
 *   - 1 px animated underline on hover; primary-coloured underline on
 *     the active route.
 */

export interface NavigationItem {
  label: string;
  href: string;
  /** Optional badge text rendered to the right of the label. */
  badge?: string;
}

export interface NavigationProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  items?: NavigationItem[];
  /** Slot rendered on the right edge (e.g. cart icon, login button). */
  actions?: React.ReactNode;
  /** Toggles backdrop blur / transparent-on-scroll behavior. */
  sticky?: boolean;
}

const defaultItems: NavigationItem[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Sản phẩm", href: "/products" },
  { label: "Câu chuyện", href: "/about" },
  { label: "Đánh giá", href: "/reviews" },
  { label: "Liên hệ", href: "/contact" },
];

export function Navigation({
  className,
  logo,
  items = defaultItems,
  actions,
  sticky = true,
  ...props
}: NavigationProps) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <header
      className={cn(
        "w-full border-b border-hairline bg-surface/80 backdrop-blur",
        sticky && "sticky top-0 z-40",
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-6 px-4 md:px-8 lg:px-16">
        <div className="flex items-center gap-8">
          {logo}
          <nav className="hidden items-center gap-6 md:flex">
            {items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative inline-flex items-center gap-1 text-[14px] font-medium tracking-[0.02em] transition-colors",
                    "after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-200",
                    "hover:after:scale-x-100",
                    active
                      ? "text-primary after:scale-x-100"
                      : "text-foreground/80 hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                  {item.badge && (
                    <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
Navigation.displayName = "Navigation";