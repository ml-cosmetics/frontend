import * as React from "react";
import { AdminShell } from "@/components/layout";
import { ForceLightTheme } from "@/components/layout/force-light-theme";

/**
 * `(admin)` route group. Admin pages render here. The shell mounts
 * the sidebar + topbar + ProtectedRoute gate using the same light
 * Aura Vénus surface as the public storefront.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ForceLightTheme />
      <AdminShell>{children}</AdminShell>
    </>
  );
}
