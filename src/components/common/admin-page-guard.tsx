"use client";

import { type ReactNode } from "react";
import { ProtectedRoute } from "@/components/common/protected-route";

interface AdminPageGuardProps {
  /**
   * Required role to access this page. Mismatched users are
   * redirected to `/admin/dashboard` (any signed-in user has access
   * there).
   */
  role: string;
  children: ReactNode;
}

/**
 * `AdminPageGuard` — thin wrapper around `ProtectedRoute` that
 * forwards a `requiredRole` so individual admin pages can opt into
 * role-based access control without lifting the route group's
 * blanket login gate.
 */
export function AdminPageGuard({ role, children }: AdminPageGuardProps) {
  return <ProtectedRoute requiredRole={role}>{children}</ProtectedRoute>;
}
