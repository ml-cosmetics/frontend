"use client";

import { useMemo } from "react";
import { useAdminAuth, type UseAdminAuthResult } from "./admin-auth-provider";

/**
 * Reusable auth-aware hooks for the admin shell.
 *
 * Each hook wraps `useAdminAuth` with a narrower surface so consumers
 * can pull only the slice they care about — keeps re-render scopes
 * tight and reads cleaner at call sites.
 */

export function useCurrentUser(): UseAdminAuthResult["user"] {
  return useAdminAuth().user;
}

export function useIsAuthenticated(): boolean {
  return useAdminAuth().isAuthenticated;
}

export function useAuthLoading(): boolean {
  return useAdminAuth().isLoading;
}

export function useAuthError(): UseAdminAuthResult["error"] {
  return useAdminAuth().error;
}

export function useAuthActions(): Pick<
  UseAdminAuthResult,
  "login" | "logout" | "refresh" | "currentUser"
> {
  const actions = useAdminAuth();
  const { login, logout, refresh, currentUser } = actions;
  return useMemo(
    () => ({ login, logout, refresh, currentUser }),
    // `currentUser` is the imperative handle from `lib/auth`; its
    // identity is stable across renders. The linter can't see that
    // through the destructuring so we explicitly omit it here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [login, logout, refresh],
  );
}
