import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/**
 * PublicFooter — Stitch storefront footer (ML Cosmetics / Aura Rose
 * Luxury Treatment).
 *
 * Single source of truth for the public footer. Used by every route
 * inside the `(public)` route group via `PublicShell`. Mirrors the
 * Stitch HTML byte-for-byte:
 *   - Full-width gradient (`from-[#FFF1F7] to-white`).
 *   - Rounded top corners (`rounded-t-xl`).
 *   - `max-w-7xl mx-auto` inner container with `grid-cols-1
 *     md:grid-cols-4 gap-12 px-12 py-20`.
 *   - Brand column: italic Playfair Display wordmark + copyright
 *     paragraph.
 *   - Three link columns (Thông tin / Hỗ trợ khách hàng / Sản phẩm)
 *     with `text-zinc-500 hover:text-[#E11D74]` + a small slide on
 *     hover (`hover:translate-x-1`).
 */

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface PublicFooterProps {
  /** Override the brand wordmark text. */
  brandLabel?: string;
  /** Override the copyright paragraph. */
  copyright?: string;
  columns?: FooterColumn[];
  className?: string;
}

const DEFAULT_COLUMNS: FooterColumn[] = [
  {
    title: "Thông tin",
    links: [
      { label: "Về chúng tôi", href: "/about" },
      { label: "Chính sách bảo mật", href: "/terms" },
      { label: "Điều khoản dịch vụ", href: "/terms" },
    ],
  },
  {
    title: "Hỗ trợ khách hàng",
    links: [
      { label: "Hướng dẫn mua hàng", href: "/faq" },
      { label: "Chính sách đổi trả", href: "/terms" },
      { label: "Vận chuyển", href: "/terms" },
    ],
  },
  {
    title: "Sản phẩm",
    links: [
      { label: "Trang sức cao cấp", href: "/products" },
      { label: "Mỹ phẩm Aura", href: "/products" },
      { label: "Combo quà tặng", href: "/products" },
    ],
  },
];

export function PublicFooter({
  brandLabel = "ML Cosmetics",
  copyright = "© 2026 ML Cosmetics. Aura Rose Luxury Treatment.",
  columns = DEFAULT_COLUMNS,
  className,
}: PublicFooterProps) {
  return (
    <footer
      className={cn(
        "mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 rounded-t-xl bg-gradient-to-b from-[#FFF1F7] to-white px-12 py-20 md:grid-cols-4",
        className,
      )}
    >
      {/* Brand column. */}
      <div className="flex flex-col space-y-4">
        <Link
          href="/"
          className="font-headline text-xl font-bold italic text-[#E11D74]"
        >
          {brandLabel}
        </Link>
        <p className="font-body text-sm text-zinc-700">{copyright}</p>
      </div>

      {/* Link columns. */}
      {columns.map((column) => (
        <div
          key={column.title}
          className="flex flex-col space-y-3 font-body text-base text-zinc-700"
        >
          <h4 className="mb-2 font-semibold text-zinc-900">{column.title}</h4>
          {column.links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="inline-block text-zinc-500 transition-colors hover:translate-x-1 hover:text-[#E11D74]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ))}
    </footer>
  );
}

PublicFooter.displayName = "PublicFooter";