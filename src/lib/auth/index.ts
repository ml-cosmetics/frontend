/**
 * `lib/auth` barrel.
 *
 * Public surface (per the brief):
 *
 *  - `login()` / `logout()` / `isAuthenticated()` / `currentUser()`
 *  - `AdminAuthProvider` (React root provider)
 *  - `useAdminAuth()` and friends (React hooks)
 *  - `tokenStore` (the persisted JWT holder) — exposed for tests
 *    and the `token-bridge`.
 *  - `ADMIN_LOGIN_PATH` / `ADMIN_HOME_PATH` — for route guards.
 */

export {
  login,
  logout,
  isAuthenticated,
  currentUser,
  bootstrapAuth,
  subscribeAuth,
  type User,
  type AdminSession,
} from "./auth";

export {
  AdminAuthProvider,
  useAdminAuth,
  type UseAdminAuthResult,
  ADMIN_LOGIN_PATH,
  ADMIN_HOME_PATH,
} from "./admin-auth-provider";

export { tokenStore } from "./token-store";

export {
  useCurrentUser,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError,
  useAuthActions,
} from "./hooks";
