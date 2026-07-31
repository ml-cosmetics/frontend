"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { useAdminAuth } from "@/lib/auth";

interface RedirectIfAuthenticatedProps {
  /**
   * Where to send an already-signed-in user. Defaults to the admin
   * dashboard. The component refuses to redirect when `redirectTo`
   * matches the current path so we never ping-pong.
   */
  redirectTo?: string;
  children: ReactNode;
}

/**
 * `<RedirectIfAuthenticated>` — used on the login page. When the
 * user is already signed in, push them to the redirect target
 * instead of showing the login form.
 *
 * Loop-guard:
 *   - if `redirectTo` === current path, skip the redirect entirely
 *   - we track a `hasRedirected` ref so a re-render from auth
 *     state oscillation doesn't fire a second `router.replace()`
 */
export function RedirectIfAuthenticated({
  redirectTo = "/admin/dashboard",
  children,
}: RedirectIfAuthenticatedProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAdminAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      hasRedirected.current = false;
      return;
    }
    if (pathname === redirectTo) return;
    if (hasRedirected.current) return;

    hasRedirected.current = true;
    router.replace(redirectTo);
  }, [isAuthenticated, isLoading, pathname, redirectTo, router]);

  if (isLoading) {
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

  return <>{children}</>;
}
