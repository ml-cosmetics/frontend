"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Favorite } from "./storefront-icons";
import { cn } from "@/lib/utils/cn";
import { useWishlist } from "@/features/wishlist";

/**
 * `WishlistNavLink` — heart icon in the top nav with a live count
 * badge driven by `useWishlist`. Kept as its own component so the
 * count re-renders independently of the rest of `TopNav`, and so
 * the SSR pass renders no badge (avoids hydration mismatch —
 * `localStorage` is only available client-side).
 */
function WishlistNavLink() {
  const wishlist = useWishlist();
  const showBadge = wishlist.isHydrated && wishlist.count > 0;
  return (
    <Link
      href="/wishlist"
      aria-label={
        showBadge
          ? `Yêu thích, ${wishlist.count} sản phẩm`
          : "Yêu thích"
      }
      className="relative text-zinc-600 transition-colors hover:text-primary"
    >
      <Favorite />
      {showBadge && (
        <span
          aria-hidden
          className="absolute -top-1 -right-2 inline-flex min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-[18px] text-primary-foreground shadow-sm"
        >
          {wishlist.count > 99 ? "99+" : wishlist.count}
        </span>
      )}
    </Link>
  );
}

/**
 * TopNav — Stitch storefront top navigation (ML Cosmetics / Aura Rose
 * Luxury Treatment).
 *
 * Single source of truth for the public header. Used by every route
 * inside the `(public)` route group via `PublicShell`. Mirrors the
 * Stitch HTML byte-for-byte:
 *   - `fixed top-0 z-50`, `h-20`, full-width, `bg-white/80 backdrop-blur`
 *   - 1 px bottom border (`border-rose-100`)
 *   - Brand wordmark: italic Playfair Display, `text-primary`
 *   - Six nav links (desktop only); active link gets the pink
 *     underline.
 *   - Three icon buttons (`search`, `favorite`, `shopping_bag`) +
 *     a single pink "Tư vấn ngay" pill (desktop only).
 *
 * Mobile collapses the nav links and shows a hamburger toggle; the
 * panel mirrors the desktop links.
 */
export interface TopNavProps {
  /** Override the brand wordmark text. Defaults to "ML Cosmetics". */
  brandLabel?: string;
  /** Override the consultation CTA href. */
  consultHref?: string;
  className?: string;
}

const NAV_ITEMS = [
  { label: "Trang chủ", href: "/" },
  { label: "Bộ sưu tập", href: "/products" },
  { label: "Khuyến mãi", href: "/promotions" },
  { label: "Về ML", href: "/about" },
  { label: "Liên hệ", href: "/contact" },
  { label: "Hỏi đáp", href: "/faq" },
] as const;

export function TopNav({
  brandLabel = "ML Cosmetics",
  consultHref = "/contact",
  className,
}: TopNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 mx-auto flex h-20 w-full max-w-full items-center justify-between border-b border-rose-100 bg-white/80 px-8 shadow-sm backdrop-blur-md",
        className,
      )}
      aria-label="Điều hướng chính"
    >
      {/* Brand wordmark (italic Playfair Display, primary pink). */}
      <Link
        href="/"
        className="font-headline text-2xl font-bold italic text-primary"
      >
        {brandLabel}
      </Link>

      {/* Desktop nav links. */}
      <div className="hidden items-center space-x-8 md:flex">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-full items-center transition-colors",
                active
                  ? "border-b-2 border-primary pb-1 font-semibold text-primary"
                  : "font-medium text-zinc-600 hover:text-primary",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Right cluster: icons + consultation pill. The cart icon is
          intentionally hidden — purchase flows route to /contact for
          direct consultation with the brand owner. */}
      <div className="flex items-center gap-6">
        <Link
          href="/search"
          aria-label="Tìm kiếm"
          className="text-zinc-600 transition-colors hover:text-primary"
        >
          <Search />
        </Link>
        <WishlistNavLink />
        <Link
          href={consultHref}
          aria-label="Tư vấn ngay"
          className="hidden rounded-2xl bg-primary px-6 py-2.5 font-medium text-white shadow-sm shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#be185d] hover:shadow-md hover:shadow-primary/40 active:translate-y-0 active:scale-95 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:block"
        >
          Tư vấn ngay
        </Link>

        {/* Mobile hamburger toggle. */}
        <button
          type="button"
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
          className="rounded-full p-2 text-zinc-600 transition-colors hover:bg-rose-50 hover:text-primary md:hidden"
        >
          <span className="material-symbols-outlined">
            {mobileOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile drawer (renders below the bar). */}
      {mobileOpen && (
        <div className="absolute left-0 right-0 top-20 border-b border-rose-100 bg-white/95 backdrop-blur-md md:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-8 py-4">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-lg px-3 py-3 text-[15px] transition-colors",
                      active
                        ? "border-l-4 border-primary font-bold text-primary"
                        : "text-zinc-700 hover:bg-rose-50 hover:text-primary",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li className="mt-2 border-t border-rose-100 pt-3">
<Link
              href={consultHref}
              onClick={() => setMobileOpen(false)}
              className="block w-full rounded-2xl bg-primary px-6 py-2.5 text-center font-medium text-white shadow-sm shadow-primary/30 transition-all duration-200 hover:bg-[#be185d] hover:shadow-md hover:shadow-primary/40 active:scale-95 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Tư vấn ngay
            </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}

TopNav.displayName = "TopNav";