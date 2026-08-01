"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell, CircleHelp, CircleUserRound, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/cn";
import { SidebarTrigger } from "./sidebar";
import { ADMIN_LOGIN_PATH } from "@/lib/auth/admin-auth-provider";
import { tokenStore } from "@/lib/auth/token-store";

/**
 * Admin topbar — light Aura Vénus skin.
 *
 * Stitch reference (project 29642013742130547, dashboard screen):
 *   - 64 px tall, sticky to the top, full-bleed
 *   - `bg-background` with a 1 px bottom border (`#27272a`)
 *   - Reading order: `ML Cosmetics` title, primary-coloured breadcrumb
 *     link ("Dashboard"), right-aligned icon cluster
 *     (notifications, help, account)
 */
export function Topbar() {
  const router = useRouter();

  const handleLogout = React.useCallback(() => {
    // Brief: chỉ cần xoá token rồi đăng xuất ra — không có API logout
    // ở backend, nên ta xoá token cục bộ rồi chuyển về trang login.
    tokenStore.clear();
    router.replace(ADMIN_LOGIN_PATH);
  }, [router]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-rose-100 bg-white px-6",
      )}
    >
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h2 className="text-[18px] font-bold text-foreground">ML Cosmetics</h2>
        <nav className="ml-8 hidden gap-4 md:flex">
          <a
            href="/admin/dashboard"
            className="text-[14px] font-bold text-primary transition-colors hover:text-foreground"
          >
            Dashboard
          </a>
        </nav>
      </div>

      <div className="flex items-center gap-4 text-muted-foreground">
        <button
          type="button"
          aria-label="Thông báo"
          className="transition-colors hover:text-foreground"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Trợ giúp"
          className="transition-colors hover:text-foreground"
        >
          <CircleHelp className="h-5 w-5" aria-hidden="true" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Tài khoản"
            className="text-2xl text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CircleUserRound className="h-6 w-6" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px]">
            <DropdownMenuLabel>Admin</DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                handleLogout();
              }}
              className="text-destructive focus:text-destructive"
            >
              <LogOut aria-hidden="true" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
