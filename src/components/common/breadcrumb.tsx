"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useBreadcrumbOverrides } from "./breadcrumb-overrides";

/**
 * Path-aware breadcrumb. Splits the current pathname into segments
 * and renders each as a link, with the last segment rendered as
 * non-link text. Anything that doesn't have a registered label is
 * rendered verbatim (e.g. dynamic IDs).
 */
const LABELS: Record<string, string> = {
  admin: "Quản trị",
  dashboard: "Tổng quan",
  products: "Sản phẩm",
  categories: "Danh mục",
  inventory: "Tồn kho",
  orders: "Đơn hàng",
  customers: "Khách hàng",
  banners: "Banner",
  content: "Nội dung",
  settings: "Cài đặt",
  notifications: "Thông báo",
  shipping: "Vận chuyển",
  permissions: "Phân quyền",
  costs: "Chi phí",
  activity: "Nhật ký hoạt động",
  account: "Hồ sơ cá nhân",
  media: "Thư viện media",
  "customer-analytics": "Phân tích khách hàng",
  "featured-collections": "Bộ sưu tập",
  new: "Tạo mới",
};

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  /** Optional override map keyed by path segment value. Useful when
   * the segment is a dynamic ID that should resolve to a friendly
   * label (e.g. product / category name). Overrides win over both the
   * `LABELS` dictionary and the raw segment. */
  overrides?: Record<string, string>;
  /** If true, segments not present in `items` / `overrides` / `LABELS`
   * are filtered out of the auto-built trail. Useful to hide dynamic
   * IDs once a friendly label has replaced them. */
  hideUnknownSegments?: boolean;
  className?: string;
}

export function Breadcrumb({ items, overrides, hideUnknownSegments, className }: BreadcrumbProps) {
  const pathname = usePathname();
  const liveOverrides = useBreadcrumbOverrides(pathname);
  const mergedOverrides = React.useMemo(
    () => (overrides ? { ...liveOverrides, ...overrides } : liveOverrides),
    [overrides, liveOverrides],
  );
  const segments = items ?? buildFromPath(pathname, mergedOverrides, hideUnknownSegments);

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-[14px] leading-[1.6] text-muted-foreground", className)}
    >
      <ol className="flex flex-wrap items-center gap-1">
        <li className="flex items-center gap-1">
          <Link
            href="/admin/dashboard"
            className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only">Trang chủ</span>
          </Link>
        </li>
        {segments.map((crumb, index) => {
          const isLast = index === segments.length - 1;
          return (
            <li
              key={`${crumb.label}-${index}`}
              className="flex items-center gap-1"
            >
              <ChevronRight
                className="h-3.5 w-3.5 text-muted-foreground"
                aria-hidden="true"
              />
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{crumb.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function buildFromPath(
  pathname: string,
  overrides?: Record<string, string>,
  hideUnknown?: boolean,
): BreadcrumbItem[] {
  const parts = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [];
  let cumulative = "";
  for (const part of parts) {
    cumulative += `/${part}`;
    const overrideLabel = overrides?.[part];
    if (overrideLabel !== undefined) {
      items.push({ label: overrideLabel, href: cumulative });
      continue;
    }
    const knownLabel = LABELS[part];
    if (knownLabel !== undefined) {
      items.push({ label: knownLabel, href: cumulative });
      continue;
    }
    if (hideUnknown) continue;
    items.push({ label: part, href: cumulative });
  }
  return items;
}
