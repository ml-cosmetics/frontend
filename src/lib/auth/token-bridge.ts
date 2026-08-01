import { tokenStore } from "./token-store";
import { setAuthToken } from "@/lib/api/axios";

/**
 * Bridges `tokenStore` ↔ the axios layer.
 *
 * The axios client maintains its own in-memory copy of the current
 * token so it doesn't have to roundtrip through `localStorage` on
 * every request. Whenever the persisted token changes we mirror it
 * into the axios module via `setAuthToken`.
 *
 * This module is imported once from `AdminAuthProvider`.
 */
export function bindAuthTokenBridge(): () => void {
  // Initial sync (so requests fired during hydration carry the token).
  setAuthToken(tokenStore.get());

  const unsubscribe = tokenStore.subscribe(() => {
    setAuthToken(tokenStore.get());
  });

  return unsubscribe;
}
