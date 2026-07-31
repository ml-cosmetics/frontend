"use client";

import * as React from "react";
import { Sidebar, SidebarProvider } from "./sidebar";
import { Topbar } from "./topbar";
import { ProtectedRoute } from "@/components/common/protected-route";
import { cn } from "@/lib/utils/cn";

/**
 * `AdminShell` — the chrome around every admin page.
 *
 * Composition:
 *
 *  ┌─────────────────────────────────────────────────┐
 *  │ <Sidebar>          │ <Topbar>                    │
 *  │                    ├─────────────────────────────┤
 *  │                    │ <main> page                 │
 *  │                    │                             │
 *  └─────────────────────────────────────────────────┘
 *
 * Wrapped in `ProtectedRoute` so every admin route auto-bounces
 * unauthenticated visitors to `/login`. The `SidebarProvider`
 * powers the collapsed-state persistence (in localStorage) and the
 * tooltip registry.
 *
 * Accessibility:
 *   - `<a class="skip-link">` lets keyboard users jump past the
 *     sidebar/topbar and into the actual page content
 *   - the main container carries a `role="main"` for screen readers
 *   - every interactive surface inside Topbar / Sidebar carries
 *     its own `aria-label`
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="admin-light aura-admin-bg flex min-h-screen text-foreground">
          <a
            href="#admin-main"
            className={cn(
              "sr-only absolute left-4 top-4 z-50 rounded-lg bg-primary px-3 py-2 text-[14px] font-medium leading-[1.6] text-primary-foreground",
              "focus-visible:not-sr-only focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            )}
          >
            Bỏ qua đến nội dung chính
          </a>
          <Sidebar />
          <div className="ml-[240px] flex min-h-screen flex-1 flex-col">
            <Topbar />
            <main
              id="admin-main"
              role="main"
              tabIndex={-1}
              className="flex-1 focus:outline-none"
            >
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
