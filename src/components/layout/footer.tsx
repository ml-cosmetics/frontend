import * as React from "react";
import { Container } from "./container";
import { Logo } from "./logo";
import { cn } from "@/lib/utils/cn";

/**
 * Footer — public storefront footer (3-4 column links + legal row).
 *
 * Matches the Aura Vénus design MD: muted background
 * (surface-container), generous padding, hairline divider above the
 * legal row. Each `column` is a titled group of links.
 */

export interface FooterColumn {
  title: string;
  links: Array<{ label: string; href: string }>;
}

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  columns?: FooterColumn[];
  legal?: React.ReactNode;
  showLogo?: boolean;
}

const defaultColumns: FooterColumn[] = [
  {
    title: "Cửa hàng",
    links: [
      { label: "Vòng tay ngọc Jadeite", href: "/products" },
      { label: "Son dưỡng Dior", href: "/products" },
      { label: "Bộ quà tặng", href: "/products" },
      { label: "Khuyến mãi", href: "/promotions" },
    ],
  },
  {
    title: "Về Aura Rose",
    links: [
      { label: "Câu chuyện thương hiệu", href: "/about" },
      { label: "Chứng nhận GRA", href: "/certificates" },
      { label: "Đánh giá khách hàng", href: "/reviews" },
      { label: "Liên hệ", href: "/contact" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Trung tâm hỗ trợ", href: "/help" },
      { label: "Chính sách đổi trả", href: "/policy" },
      { label: "Vận chuyển", href: "/policy" },
      { label: "Điều khoản dịch vụ", href: "/policy" },
    ],
  },
];

export function Footer({
  className,
  columns = defaultColumns,
  legal,
  showLogo = true,
  ...props
}: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer
      className={cn(
        "border-t border-hairline bg-surface-container text-foreground",
        className,
      )}
      {...props}
    >
      <Container size="xl" className="py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {showLogo && (
            <div className="space-y-3">
              <Logo size="md" />
              <p className="max-w-xs text-[14px] leading-relaxed text-muted-foreground">
                Aura Rose — tuyển tập son dưỡng Dior và vòng tay ngọc
                Jadeite chính hãng, được tuyển chọn bởi ML Cosmetics.
              </p>
            </div>
          )}
          {columns.map((column) => (
            <div key={column.title} className="space-y-3">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.05em] text-foreground">
                {column.title}
              </h3>
              <ul className="space-y-2 text-[14px]">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-hairline pt-6 text-[12px] text-muted-foreground md:flex-row md:items-center">
          <p>
            © {year} ML Cosmetics — Aura Rose. Mọi quyền được bảo lưu.
          </p>
          {legal ?? (
            <div className="flex gap-4">
              <a href="/policy" className="hover:text-foreground">
                Điều khoản
              </a>
              <a href="/policy" className="hover:text-foreground">
                Bảo mật
              </a>
              <a href="/policy" className="hover:text-foreground">
                Cookies
              </a>
            </div>
          )}
        </div>
      </Container>
    </footer>
  );
}
Footer.displayName = "Footer";