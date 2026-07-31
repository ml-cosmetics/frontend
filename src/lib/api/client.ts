/**
 * The shared axios instance — kept here as a backwards-compatible
 * shim. New code should import the explicit `publicApiClient` /
 * `adminApiClient` from `./axios` instead. The split ensures the JWT
 * is only ever attached to admin routes.
 *
 * Behaviour:
 *   - `apiClient` resolves to the public instance (no auth header).
 *   - `get` / `post` / `put` / `patch` / `del` / `upload` all run
 *     against the public instance.
 *   - Auth-event listener wiring and token subscription helpers are
 *     re-exported from `./axios`.
 */
export {
  apiClient,
  adminApiClient,
  publicApiClient,
  getAuthToken,
  setAuthToken,
  subscribeAuthToken,
  onAuthEvent,
  unwrap,
  unwrapMaybe,
  get,
  post,
  put,
  patch,
  del,
  upload,
  type AuthEventListener,
} from "./axios";

export { APIError } from "./axios";
