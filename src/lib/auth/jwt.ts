/**
 * Tiny JWT payload decoder.
 *
 * We only need the `sub` (user ID) and `role` from the access token to
 * populate the cached `User`, plus `exp` to detect local expiry before
 * round-tripping to the server. The backend issues HS256 tokens with
 * the standard `{ sub, role, exp, iat }` payload (see
 * `backend/internal/shared/auth/`).
 *
 * Why not `jwt-decode`?
 *   - We only read the payload, never verify it (the server is the
 *     single source of truth — every protected endpoint re-validates).
 *   - One less dependency in the bundle.
 *   - Decoding is a couple of lines.
 */

export interface JWTPayload {
  sub: string;
  role: string;
  exp: number;
  iat: number;
}

/**
 * Decode a JWT payload without verification. Returns `null` for any
 * malformed input (3-part structure, base64 padding, valid JSON,
 * required keys present). Callers must treat `null` as "no token".
 */
export function decodeJWT(token: string): JWTPayload | null {
  if (typeof token !== "string" || token.length === 0) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const payload = parts[1];
  if (!payload) return null;

  // Base64url → base64. Padding is technically required by `atob` but
  // missing on tokens issued by most JWT libraries.
  const padded = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padding = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  let decoded: string;
  try {
    decoded = atob(padded + padding);
  } catch {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(decoded);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;
  if (typeof obj.sub !== "string") return null;
  if (typeof obj.role !== "string") return null;
  if (typeof obj.exp !== "number") return null;
  if (typeof obj.iat !== "number") return null;

  return {
    sub: obj.sub,
    role: obj.role,
    exp: obj.exp,
    iat: obj.iat,
  };
}

/**
 * `true` when `exp` is in the past. Comparison uses epoch seconds —
 * JWT spec mandates integer epoch seconds for `exp`.
 */
export function isJWTExpired(payload: JWTPayload, nowSeconds: number = Math.floor(Date.now() / 1000)): boolean {
  return payload.exp <= nowSeconds;
}
