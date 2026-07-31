"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { type APIError, onAuthEvent } from "@/lib/api";
import {
  bootstrapAuth,
  currentUser,
  isAuthenticated,
  login,
  logout,
  subscribeAuth,
  type AdminSession,
  type User,
} from "./auth";
import { tokenStore } from "./token-store";

/**
 * Single source of truth for the admin user session (React surface).
 *
 * The pure auth logic lives in `./auth`. This provider re-shapes it
 * into a React-friendly context by:
 *
 *   - calling `bootstrapAuth()` once on mount
 *   - subscribing to `subscribeAuth()` so the tree re-renders when
 *     the user signs in / out / is bumped out by 401
 *   - wiring the global `onAuthEvent` listener so any 401 anywhere
 *     in the app clears the session and bounces to `/login`
 */

export interface UseAdminAuthResult {
  /** Resolved user (or `null` when not signed in). */
  user: User | null;
  /** True when a token and a resolved user are both present. */
  isAuthenticated: boolean;
  /** True while the very first token rehydration is in flight. */
  isLoading: boolean;
  /** Last auth error (e.g. 401 during rehydration). Cleared on success. */
  error: APIError | null;
  /** Sign in via `POST /v1/auth/login`. */
  login: (args: { username: string; password: string; remember: boolean }) => Promise<void>;
  /** Sign out and clear the session. */
  logout: () => Promise<void>;
  /** Force-rehydrate the session from the persisted token. */
  refresh: () => Promise<void>;
  /** Synchronous read for event handlers outside the React tree. */
  currentUser: () => User | null;
}

export const ADMIN_LOGIN_PATH = "/login";
export const ADMIN_HOME_PATH = "/admin/dashboard";

interface AdminAuthProviderProps {
  children: ReactNode;
}

/**
 * Module-level singletons returned from the `getServerSnapshot` and
 * the empty-state `getSnapshot` branches. Must be the same reference
 * on every call — otherwise React warns "The result of getServerSnapshot
 * should be cached to avoid an infinite loop" in development.
 */
const EMPTY_TOKEN: string | null = null;
const EMPTY_SESSION: AdminSession = { user: null };

const AdminAuthContext = createContext<UseAdminAuthResult | null>(null);

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const router = useRouter();

  /* ------------------------------------------------------------------ *
   * Reactive session + token views.
   * ------------------------------------------------------------------ */

  /* ------------------------------------------------------------------ *
   * Reactive session + token views.
   *
   * `useSyncExternalStore` requires:
   *   - `subscribe`: a STABLE function (same reference across renders).
   *   - `getSnapshot` / `getServerSnapshot`: must return the SAME
   *     reference between calls when the underlying value hasn't
   *     changed. We achieve this by keeping a single, module-level
   *     `EMPTY_SESSION` constant for the no-session case and a
   *     `useRef` cache for live values.
   * ------------------------------------------------------------------ */

  const subscribeToken = useMemo(
    () => tokenStore.subscribe.bind(tokenStore),
    [],
  );

  const tokenLiveRef = useRef<string | null>(null);
  const tokenRefForRender = useRef<string | null>(null);
  useEffect(() => {
    // Hydrate the live ref from storage on mount and on every notify.
    tokenLiveRef.current = tokenStore.get();
    tokenRefForRender.current = tokenLiveRef.current;
    return subscribeToken(() => {
      const next = tokenStore.get();
      if (next !== tokenRefForRender.current) {
        tokenLiveRef.current = next;
        tokenRefForRender.current = next;
      }
    });
  }, [subscribeToken]);
  const token = useSyncExternalStore<string | null>(
    subscribeToken,
    () => tokenRefForRender.current,
    () => EMPTY_TOKEN,
  );

  const sessionRef = useRef<AdminSession>(EMPTY_SESSION);
  useEffect(() => {
    sessionRef.current = { user: currentUser() };
    return subscribeAuth(() => {
      sessionRef.current = { user: currentUser() };
    });
  }, []);
  const session = useSyncExternalStore<AdminSession>(
    subscribeAuth,
    () => sessionRef.current,
    () => EMPTY_SESSION,
  );

  /* ------------------------------------------------------------------ *
   * Bootstrap state — the in-flight `bootstrapAuth()` promise.
   * ------------------------------------------------------------------ */

  const [bootstrapState, setBootstrapState] = useState<{
    isLoading: boolean;
    error: APIError | null;
  }>({ isLoading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    bootstrapAuth()
      .then(() => {
        if (cancelled) return;
        setBootstrapState({ isLoading: false, error: null });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setBootstrapState({ isLoading: false, error: error as APIError });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------------------------------------------ *
   * 401/403 listener — bounce to /login.
   * ------------------------------------------------------------------ */

  const clearSession = useMemo(() => {
    return () => {
      tokenStore.clear();
      // We don't `queryClient.clear()` wholesale: cached storefront
      // data remains valid across login flashes, and the auth user
      // no longer lives in React Query — it's mirrored from the JWT
      // payload in module-level state.
    };
  }, []);

  useEffect(() => {
    return onAuthEvent((event) => {
      if (event.kind === "unauthorized") {
        clearSession();
        const next =
          typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : ADMIN_HOME_PATH;
        router.replace(`${ADMIN_LOGIN_PATH}?next=${encodeURIComponent(next)}`);
      }
    });
  }, [clearSession, router]);

  /* ------------------------------------------------------------------ *
   * Imperative handles.
   * ------------------------------------------------------------------ */

  const handleLogin = useMemo(
    () =>
      async (args: { username: string; password: string; remember: boolean }) => {
        await login(args);
      },
    [],
  );

  const handleLogout = useMemo(
    () => async () => {
      await logout();
      router.replace(ADMIN_LOGIN_PATH);
    },
    [router],
  );

  const refresh = useMemo(() => async () => {
    await bootstrapAuth();
  }, []);

  const value = useMemo<UseAdminAuthResult>(
    () => ({
      user: session.user,
      isAuthenticated: isAuthenticated(),
      isLoading: bootstrapState.isLoading && token === null,
      error: bootstrapState.error,
      login: handleLogin,
      logout: handleLogout,
      refresh,
      currentUser,
    }),
    [
      session,
      token,
      bootstrapState.isLoading,
      bootstrapState.error,
      handleLogin,
      handleLogout,
      refresh,
    ],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

/**
 * Use inside client components to read / mutate the admin session.
 * Throws when used outside `AdminAuthProvider` so mistakes surface
 * at runtime instead of silently breaking.
 */
export function useAdminAuth(): UseAdminAuthResult {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within <AdminAuthProvider>");
  }
  return ctx;
}
