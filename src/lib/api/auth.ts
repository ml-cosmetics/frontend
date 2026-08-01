import { adminApiClient, publicApiClient, APIError, unwrap } from "./axios";
import type { ApiSuccessEnvelope, LoginResponse } from "@/types";

/**
 * Typed client for the authentication endpoints.
 *
 * Endpoint surface:
 *
 *  - `POST /auth/login`           — public. Returns `{ token }`.
 *  - `POST /auth/change-password` — admin.
 *  - `POST /auth/logout`          — admin. Best-effort.
 *
 * The login route is on the public surface (you must be able to
 * sign in anonymously), so it goes through `publicApiClient`.
 * `change-password` and `logout` require the bearer header and
 * therefore route through `adminApiClient`.
 *
 * Note: there is intentionally NO `GET /auth/me`. The backend is
 * stateless — the JWT itself carries `{ sub, role, exp, iat }`,
 * which the frontend decodes locally to populate the cached
 * `User`. See `lib/auth/jwt.ts`.
 *
 * We re-export the `APIError` class so callers can `instanceof`
 * check it without importing the axios module directly.
 */

export const authApi = {
  /**
   * `POST /v1/auth/login`.
   *
   * Body: `{ username, password, remember? }`.
   *
   * The backend (`internal/handler/rest/v1/auth/login_models.go`)
   * expects `username` and returns `{ token, role }`.
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const body = {
      username: credentials.username,
      password: credentials.password,
      remember: credentials.remember,
    };
    const response = await publicApiClient.post<ApiSuccessEnvelope<LoginResponse>>(
      "/auth/login",
      body,
    );
    return unwrap(response);
  },

  /**
   * `POST /v1/auth/logout` (best-effort). If the backend doesn't
   * expose a server-side logout (jwt stateless), the local token
   * drop is sufficient.
   */
  async logout(): Promise<void> {
    try {
      await adminApiClient.post<ApiSuccessEnvelope<Record<string, never>>>(
        "/auth/logout",
        {},
      );
    } catch (error) {
      if (error instanceof APIError && (error.isUnauthorized || error.isNotFound)) {
        return;
      }
      // For 5xx or network issues we still want local logout to
      // proceed — rethrow only fatal client errors.
      throw error;
    }
  },
};

export interface LoginCredentials {
  username: string;
  password: string;
  remember: boolean;
}

export type { APIError };
export type { LoginResponse, User } from "@/types";
