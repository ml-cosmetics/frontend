"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Layers,
  ShoppingCart,
  Users,
  // Image as ImageIcon, — hidden until media module lands
  MonitorPlay,
  Sparkles,
  Settings,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Admin sidebar — the light Aura Vénus skin used by the storefront and admin.
 *
 * Mirrors the navigation hierarchy from the IA doc
 * (`docs/02-information-architecture.md` section 2.5.2):
 *
 *   Tổng quan
 *   Sản phẩm / Danh mục / Tồn kho / Media
 *   Đơn hàng
 *   Khách hàng
 *   Nội dung (Banner)
 *   Cài đặt
 *
 * Sidebar items that have no backend handler yet (Vận chuyển, Chi phí,
 * Phân tích, Nhật ký hoạt động, Notifications, Phân quyền) are
 * intentionally hidden until their handlers land — see the scope note
 * in `docs/03-functional-requirements.md` (3.12 Vận chuyển, 3.13 Chi
 * phí, 3.16 Phân tích, 3.17 Lịch sử thao tác, 3.1.11 Không có quản
 * lý tài khoản / phân quyền). Plumbing them now would just surface
 * 404s to the operator.
 *
 * `Thư viện media` is also temporarily hidden (line below) — the FE
 * surface exists but the backend `media` module is not yet wired into
 * V1Routes, so opening the page would only 404 on every request.
 * Uncomment to re-enable when the backend module lands.
 */

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; };

const PRIMARY_NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/categories", label: "Danh mục", icon: FolderTree },
  { href: "/admin/inventory", label: "Tồn kho", icon: Layers },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
  { href: "/admin/customers", label: "Khách hàng", icon: Users },
  // { href: "/admin/media", label: "Thư viện media", icon: ImageIcon },
  { href: "/admin/banners", label: "Banner CMS", icon: MonitorPlay },
  { href: "/admin/featured-collections", label: "Bộ sưu tập nổi bật", icon: Sparkles },
];

const FOOTER_NAV: NavItem[] = [
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
  { href: "/admin/account", label: "Hồ sơ cá nhân", icon: UserCircle },
];

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, toggle: () => setCollapsed((p) => !p) }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside <SidebarProvider>");
  return ctx;
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 hidden h-screen w-[240px] flex-col border-r border-rose-100 bg-white py-4 md:flex",
      )}
      aria-label="Thanh điều hướng quản trị"
    >
      <div className="flex items-center gap-2 border-b border-rose-100 px-4 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[14px] font-bold text-primary-foreground">
          ML
        </div>
        <div className="leading-tight">
          <div className="text-[14px] font-bold text-foreground">ML Cosmetics</div>
          <div className="text-[12px] text-muted-foreground">Luxury Beauty Operations</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2" aria-label="Danh mục điều hướng">
        <ul className="space-y-1 px-2">
          {PRIMARY_NAV.map((item) => (
            <li key={item.label}>
              <NavLink
                item={item}
                active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
              />
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-rose-100 pt-2">
        <ul className="mt-2 space-y-1 px-2">
          {FOOTER_NAV.map((item) => (
            <li key={item.label}>
              <NavLink
                item={item}
                active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
              />
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-2 rounded-[2px] px-2 py-2",
        "text-[14px] transition-colors duration-200",
        active
          ? "border-l-2 border-primary bg-rose-50 font-semibold text-primary shadow-[0_4px_12px_-4px_rgba(225,29,116,0.20)]"
          : "text-muted-foreground hover:bg-rose-50 hover:text-primary",
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          active ? "text-primary" : "text-muted-foreground group-hover:text-primary",
        )}
        aria-hidden="true"
      />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function SidebarTrigger({ className }: { className?: string }) {
  // Mobile drawer trigger — kept for completeness but the Stitch
  // reference is desktop-only.
  return (
    <button
      type="button"
      className={cn("rounded-md border border-rose-100 p-2 text-foreground md:hidden", className)}
      aria-label="Mở menu"
    >
      <LayoutDashboard className="h-4 w-4" />
    </button>
  );
}
