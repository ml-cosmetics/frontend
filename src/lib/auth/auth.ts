import { authApi, type APIError } from "@/lib/api";
import { tokenStore } from "./token-store";
import { bindAuthTokenBridge } from "./token-bridge";
import { decodeJWT, isJWTExpired, type JWTPayload } from "./jwt";
import type { User } from "@/types";

/**
 * Pure (non-React) façade for the admin auth flow.
 *
 * The React tree reads the live session via `useAdminAuth`. This
 * module exposes the imperative surface (`login`, `logout`,
 * `isAuthenticated`, `currentUser`) so utility scripts, tests, and
 * non-React call sites can interact with the session without
 * reaching into React internals.
 *
 * Persistence:
 *  - JWT is stored via `tokenStore` (localStorage).
 *  - The `User` is derived from the JWT payload (`sub` + `role`).
 *    The backend's stateless design means there is no `/auth/me`
 *    endpoint; the token itself is the source of identity. The
 *    server re-validates the JWT on every protected call, so we
 *    never need to roundtrip just to read the user record.
 *
 * Naming follows the brief:
 *   login() / logout() / isAuthenticated() / currentUser().
 */

export interface AdminSession {
  user: User | null;
}

let session: AdminSession = { user: null };
const sessionListeners = new Set<(snapshot: AdminSession) => void>();

function setSession(next: AdminSession): void {
  session = next;
  for (const listener of sessionListeners) listener(session);
}

let bridge: () => void = () => {};
let bootstrapPromise: Promise<void> | null = null;

/**
 * Map a decoded JWT payload to the minimal `User` shape consumed by
 * the React tree. `id` comes from `sub` (the user's UUID), `role`
 * is the role claim, and the optional profile fields stay `null`
 * because the backend doesn't expose them on the login response.
 */
function userFromPayload(payload: JWTPayload): User {
  // We only know `sub` (UUID) and `role` from the token. Mirror `sub`
  // into `username` so call sites that render `${user.username}` keep
  // working; see `types/domain.ts` for the rationale.
  return {
    id: payload.sub,
    username: payload.sub,
    role: payload.role,
    full_name: null,
    email: null,
    avatar_url: null,
  };
}

/**
 * Initialise the auth module. Idempotent — called by `AdminAuthProvider`
 * on mount. Wires the token store to the axios instance and, if a
 * persisted token exists, rehydrates the `User` from its JWT payload.
 *
 * Returns the same promise on subsequent calls so React's StrictMode
 * double-mount doesn't double-fire the bootstrap.
 */
export function bootstrapAuth(): Promise<void> {
  if (bootstrapPromise) return bootstrapPromise;

  bridge = bindAuthTokenBridge();

  const persisted = tokenStore.get();
  if (!persisted) {
    setSession({ user: null });
    bootstrapPromise = Promise.resolve();
    return bootstrapPromise;
  }

  const payload = decodeJWT(persisted);
  if (!payload) {
    // Stored value isn't a JWT at all (legacy or corrupted). Drop it
    // so the next login starts clean.
    tokenStore.clear();
    setSession({ user: null });
    bootstrapPromise = Promise.resolve();
    return bootstrapPromise;
  }

  if (isJWTExpired(payload)) {
    // Token expired in storage — clear locally; the next 401 from a
    // protected call would do this anyway, but doing it here means
    // we don't flash the protected UI for one tick before the bounce.
    tokenStore.clear();
    setSession({ user: null });
    bootstrapPromise = Promise.resolve();
    return bootstrapPromise;
  }

  // Token + valid payload → restore the session without any network hop.
  setSession({ user: userFromPayload(payload) });
  bootstrapPromise = Promise.resolve();
  return bootstrapPromise;
}

/**
 * Imperative login. Persists the token with the requested remember
 * preference, mirrors it into the axios layer, then caches the
 * `User` derived from the JWT payload so the synchronous
 * `currentUser()` reads return immediately on the next tick.
 */
export async function login(args: {
  username: string;
  password: string;
  remember: boolean;
}): Promise<void> {
  const response = await authApi.login({
    username: args.username,
    password: args.password,
    remember: args.remember,
  });
  tokenStore.set(response.token, args.remember);
  bridge();

  const payload = decodeJWT(response.token);
  setSession({
    user: payload ? userFromPayload(payload) : null,
  });
}

/**
 * Imperative logout. Best-effort server call, then drops the
 * token + user locally. The backend has no `/auth/logout` route
 * (JWT stateless) — we still call it for forward-compat and swallow
 * any 404/401.
 */
export async function logout(): Promise<void> {
  try {
    await authApi.logout();
  } catch {
    /* swallow — local clear is enough */
  } finally {
    tokenStore.clear();
    setSession({ user: null });
  }
}

/** Synchronous — does not call the backend. */
export function isAuthenticated(): boolean {
  return tokenStore.get() !== null && session.user !== null;
}

/**
 * Synchronous read of the current user. `null` when not signed in.
 * Returns the memoised reference, so React consumers should still
 * opt into the React context (`useAdminAuth`) to subscribe to
 * updates.
 */
export function currentUser(): User | null {
  return session.user;
}

export function subscribeAuth(listener: (snapshot: AdminSession) => void): () => void {
  sessionListeners.add(listener);
  return () => sessionListeners.delete(listener);
}

export type { User } from "@/types";
export type { APIError };
