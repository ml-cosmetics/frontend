/**
 * `tokenStore` — the persisted holder for the admin JWT.
 *
 * The brief specifies `localStorage` for the token. We also drop a
 * thin cookie marker (`ml_admin_session=1`) so the auth provider can
 * make the "have we ever been signed in?" check from a single source
 * during rehydration. The cookie carries **no secret** — only the
 * fact that *some* token previously existed. The real token lives in
 * `localStorage[ml.admin.token]`.
 *
 * Rehydration does not require a network roundtrip: the JWT itself
 * carries `{ sub, role, exp, iat }` (see `lib/auth/jwt.ts`).
 */

const TOKEN_STORAGE_KEY = "ml.admin.token";
const COOKIE_NAME = "ml_admin_session";
const REMEMBER_STORAGE_KEY = "ml.admin.remember";

type Listener = () => void;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const target = `${name}=`;
  for (const part of document.cookie.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(target)) {
      return decodeURIComponent(trimmed.slice(target.length));
    }
  }
  return null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

function clearCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; SameSite=Lax; Max-Age=0`;
}

class TokenStore {
  private listeners = new Set<Listener>();

  /**
   * Read the token from `localStorage`. Returns `null` on the server
   * or when the key is missing.
   */
  get(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Persist the token and drop the cookie marker. Called by the
   * login handler right after `POST /auth/login` returns a JWT.
   */
  set(token: string, remember: boolean): void {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
        window.localStorage.setItem(REMEMBER_STORAGE_KEY, remember ? "1" : "0");
      } catch {
        // Storage quota / private-mode — silently degrade to in-session only.
      }
    }
    // Cookie marker capped to 1 day when "remember me" is off so
    // sessionStorage-style tab-only sessions correctly disappear on
    // tab close, and capped to 30 days otherwise.
    writeCookie(COOKIE_NAME, "1", remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60);
    this.notify();
  }

  /**
   * Drop the token (localStorage + cookie marker). Called on
   * explicit logout or on a 401 from any admin route.
   */
  clear(): void {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        window.localStorage.removeItem(REMEMBER_STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
    clearCookie(COOKIE_NAME);
    this.notify();
  }

  /**
   * True when a cookie marker is present in the current document.
   * Used to decide whether the auth provider should attempt to
   * rehydrate the session on mount.
   */
  hasClientCookie(): boolean {
    return readCookie(COOKIE_NAME) === "1";
  }

  /** Returns the saved "remember me" preference (defaults to true). */
  readRememberPreference(): boolean {
    if (typeof window === "undefined") return true;
    try {
      const raw = window.localStorage.getItem(REMEMBER_STORAGE_KEY);
      // Default to true when nothing was written — keeps the wider
      // audience on the longer 30-day cookie.
      return raw === null ? true : raw === "1";
    } catch {
      return true;
    }
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) listener();
  }

  // Reserved for SSR — the auth provider may pre-seed this on the
  // server via Set-Auth-Token-from-Cookie, but for the moment we
  // hydrate entirely on the client (the brief mandates localStorage).
  __setSilently(token: string | null): void {
    if (typeof window === "undefined") return;
    if (token === null) {
      try {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      } catch {
        /* ignore */
      }
    } else {
      try {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
      } catch {
        /* ignore */
      }
    }
    this.notify();
  }
}

export const tokenStore = new TokenStore();
export { TOKEN_STORAGE_KEY, COOKIE_NAME, REMEMBER_STORAGE_KEY };
