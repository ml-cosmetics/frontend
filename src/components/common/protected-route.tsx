"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ADMIN_LOGIN_PATH, useAdminAuth } from "@/lib/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  /**
   * Optional inline fallback while we rehydrate. Defaults to a
   * centered spinner so the layout doesn't pop.
   */
  fallback?: ReactNode;
  /**
   * Optional role gate — when set, the user must have the same role
   * claim in their JWT to render children. Mismatched roles get
   * bounced to `/admin/dashboard` (a safe landing page they already
   * have access to) instead of `/login`, since they ARE signed in.
   */
  requiredRole?: string;
}

/**
 * Client-side guard for the admin section. Renders children only
 * when a User is resolved; otherwise redirects to `/login` with a
 * `next` query so the user is bounced back after signing in.
 *
 * Loop-prevention:
 *
 *  - we skip the redirect if we are already on `/login`
 *  - we skip the redirect if we've already redirected this render
 *    tree (tracked by `hasRedirected` ref)
 *
 * SSR: the check runs on the client. The first paint keeps the
 * fallback visible so the route never flashes protected content.
 * Server-side enforcement would require a server-side session proxy
 * — out of scope for the foundation deliverable.
 */
export function ProtectedRoute({ children, fallback, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAdminAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      if (requiredRole && user?.role !== requiredRole) {
        // Signed in but lacking the role for this page — bounce
        // somewhere they have access to. /admin/dashboard is the
        // canonical landing for any signed-in user.
        if (!hasRedirected.current && pathname !== "/admin/dashboard") {
          hasRedirected.current = true;
          router.replace("/admin/dashboard");
        }
      } else {
        hasRedirected.current = false;
      }
      return;
    }
    if (pathname === ADMIN_LOGIN_PATH) return;
    if (hasRedirected.current) return;

    hasRedirected.current = true;
    const next =
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : "/";
    router.replace(`${ADMIN_LOGIN_PATH}?next=${encodeURIComponent(next)}`);
  }, [isAuthenticated, isLoading, user, requiredRole, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return fallback ?? <FullScreenFallback />;
  }
  if (requiredRole && user?.role !== requiredRole) {
    return fallback ?? <FullScreenFallback />;
  }

  return <>{children}</>;
}

function FullScreenFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
        aria-label="Đang tải"
        role="status"
      />
    </div>
  );
}
