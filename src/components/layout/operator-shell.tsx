import * as React from "react";
import { ForceLightTheme } from "@/components/layout/force-light-theme";
import { Sidebar, SidebarProvider } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { cn } from "@/lib/utils/cn";

/**
 * Operator shell — the light Aura Vénus chrome used by `/ops`.
 * It reuses the same navigation as the admin area without the auth gate.
 */
export function OperatorShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ForceLightTheme />
      <SidebarProvider>
        <div className="admin-light aura-admin-bg flex min-h-screen text-foreground">
          <a
            href="#ops-main"
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
              id="ops-main"
              role="main"
              tabIndex={-1}
              className="flex-1 focus:outline-none"
            >
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
