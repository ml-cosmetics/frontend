import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from "axios";
import type { ApiErrorEnvelope, ApiErrorCode, ApiSuccessEnvelope, Pagination } from "@/types";
import { APIError } from "./errors";

/**
 * The shared axios factory used by the API layer.
 *
 * Two instances are produced:
 *
 *  - {@link publicApiClient}  — catalog / public endpoints. NEVER
 *    attaches the JWT and never fires the auth-event listener. Used
 *    by the storefront data fetchers.
 *  - {@link adminApiClient}   — admin-only endpoints. Injects the
 *    JWT on every request and emits 401 / 403 events so the
 *    `AdminAuthProvider` can clear the session and bounce to
 *    `/login`.
 *
 * Both instances share the same envelope unwrap + error normalisation
 * logic so callers always see {@link APIError}, never `AxiosError`.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export const API_BASE_PATH = "/v1";
export const API_BASE = `${API_BASE_URL}${API_BASE_PATH}`;

const DEFAULT_TIMEOUT = 30_000;

const baseConfig = {
  baseURL: API_BASE,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    Accept: "application/json",
    // Intentionally NOT setting a default `Content-Type`: axios 1.x's
    // built-in `transformRequest` checks the request body type and
    // only sets `application/json` when the body is a plain object.
    // A pre-set `Content-Type: application/json` would force that
    // transform even for `FormData` uploads, turning the multipart
    // body into `{"file":{}}` (File objects don't survive JSON.stringify).
    // Each call site sets its own Content-Type when needed; for
    // JSON bodies axios still picks `application/json` automatically.
  },
};

/**
 * Auth-event listener interface. Only the admin instance emits these.
 */
export type AuthEventListener = (event: {
  kind: "unauthorized" | "forbidden";
  url: string;
}) => void;

const authListeners = new Set<AuthEventListener>();

export function onAuthEvent(listener: AuthEventListener): () => void {
  authListeners.add(listener);
  return () => authListeners.delete(listener);
}

function emitAuthEvent(event: { kind: "unauthorized" | "forbidden"; url: string }): void {
  for (const listener of authListeners) listener(event);
}

/**
 * Public store for the JWT (injected by {@link tokenStore}).
 *
 * Kept as a module-level accessor — both the admin client and the
 * auth provider read it. Keeping this file independent of the
 * `lib/auth` module avoids a circular dependency (the API layer
 * doesn't depend on auth; auth depends on the API).
 */
let currentToken: string | null = null;
const tokenSubscribers = new Set<(token: string | null) => void>();

export function setAuthToken(token: string | null): void {
  currentToken = token;
  for (const subscriber of tokenSubscribers) subscriber(token);
}

export function getAuthToken(): string | null {
  return currentToken;
}

export function subscribeAuthToken(
  listener: (token: string | null) => void,
): () => void {
  tokenSubscribers.add(listener);
  return () => tokenSubscribers.delete(listener);
}

/* ------------------------------------------------------------------ *
 * Response interceptor — unwrap envelope + normalise errors
 * ------------------------------------------------------------------ */

/**
 * The Go backend serves paginated lists in a flat shape:
 *
 *   { items: T[], total?: number, limit?: number, has_next?: boolean,
 *     has_previous?: boolean, page?: number }
 *
 * but the rest of the frontend (types, components, hooks) reads the
 * nested `pagination` envelope:
 *
 *   { items: T[], pagination: { page, limit, offset, total, total_pages,
 *     has_next, has_previous } }
 *
 * This transformer rewrites the former into the latter so every call
 * site can rely on `data.pagination.total_pages` without each module
 * re-deriving it. Endpoints that already ship a `pagination` block
 * (some admin routes) and endpoints without an `items` array (single
 * records, settings, etc.) pass through untouched.
 */
function normalisePagination(data: unknown, requestParams?: Record<string, unknown>): unknown {
  if (!data || typeof data !== "object") return data;
  const record = data as Record<string, unknown>;
  if (!Array.isArray(record.items)) return data;
  if (record.pagination && typeof record.pagination === "object") return data;

  const items = record.items as unknown[];
  const limit = Number(record.limit ?? 20) || 20;

  // The backend's list endpoint accepts `offset` + `limit` (see
  // paginationkit.OffsetRequest). We mirror that on the wire via
  // `toPageRequest`, so by the time this interceptor runs we can
  // trust the request params as the authoritative source for the
  // requested page / offset — the response itself only echoes
  // `limit`, `has_next`, `has_previous`, `total`.
  const reqOffset = readNumber(requestParams?.offset);
  const reqPage = readNumber(requestParams?.page);
  const reqLimit = readNumber(requestParams?.per_page) ?? limit;
  const effectiveLimit = reqLimit > 0 ? reqLimit : limit;

  const responseOffset = readNumber(record.offset);
  const responsePage = readNumber(record.page);

  const page =
    responsePage !== null && responsePage > 0
      ? responsePage
      : reqPage !== null && reqPage > 0
        ? reqPage
        : responseOffset !== null
          ? Math.floor(responseOffset / Math.max(1, effectiveLimit)) + 1
          : reqOffset !== null
            ? Math.floor(reqOffset / Math.max(1, effectiveLimit)) + 1
            : 1;

  const offset =
    responseOffset !== null
      ? responseOffset
      : reqOffset !== null
        ? reqOffset
        : (page - 1) * effectiveLimit;

  const total =
    typeof record.total === "number"
      ? record.total
      : typeof record.total === "string"
        ? Number(record.total)
        : null;
  // When the backend doesn't expose `total` at all, fall back to the
  // current page size so the UI can still render a sane caption and
  // `has_next` defaults to false.
  const totalResolved = total ?? items.length;
  const total_pages = Math.max(1, Math.ceil(totalResolved / Math.max(1, effectiveLimit)));
  const has_next =
    typeof record.has_next === "boolean"
      ? record.has_next
      : page < total_pages;
  const has_previous =
    typeof record.has_previous === "boolean"
      ? record.has_previous
      : page > 1;

  const pagination: Pagination = {
    page,
    limit: effectiveLimit,
    offset,
    total: total,
    total_pages,
    has_next,
    has_previous,
  };

  return { ...record, pagination };
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/**
 * Pull the request params back out for the paginated-list normaliser.
 *
 * Two paths can carry the pagination knobs:
 *   1. The list API calls string-concat them into the URL via
 *      `toQueryString`, in which case they end up in `config.url`.
 *   2. (Future) callers pass them via `config.params`, in which case
 *      they end up in `config.params`.
 *
 * The normaliser needs to read whichever path produced them, so we
 * merge both sources and let the value-resolution fall through.
 */
function extractRequestParams(
  configParams: unknown,
  configUrl?: string,
): Record<string, unknown> | undefined {
  const merged: Record<string, unknown> = {};
  if (configParams && typeof configParams === "object") {
    Object.assign(merged, configParams as Record<string, unknown>);
  }
  if (configUrl) {
    const queryIndex = configUrl.indexOf("?");
    if (queryIndex >= 0) {
      const search = new URLSearchParams(configUrl.slice(queryIndex + 1));
      for (const [key, value] of search.entries()) {
        if (!(key in merged)) merged[key] = value;
      }
    }
  }
  return Object.keys(merged).length > 0 ? merged : undefined;
}

type ResponseInterceptor = (response: AxiosResponse) => AxiosResponse;
type ErrorInterceptor = (error: unknown) => unknown;

function envelopeInterceptor(emitAuth: boolean): {
  onFulfilled: ResponseInterceptor;
  onRejected: ErrorInterceptor;
} {
  return {
    onFulfilled: (response) => {
      // Normalise paginated list shapes before callers see the data.
      // We mutate the envelope in-place so subsequent interceptors and
      // `unwrap()` see the canonical nested shape.
      if (response.data && typeof response.data === "object" && "data" in response.data) {
        response.data.data = normalisePagination(
          response.data.data,
          extractRequestParams(response.config?.params, response.config?.url),
        );
      }
      return response;
    },
    onRejected: (rawError) => {
      const error = rawError as AxiosError<ApiErrorEnvelope>;
      const status = error.response?.status ?? 0;
      const url = error.config?.url ?? "";
      const envelope = error.response?.data;

      const code: ApiErrorCode =
        (envelope?.error?.code as ApiErrorCode | undefined) ?? "INTERNAL";
      const message =
        envelope?.error?.message ??
        error.message ??
        "Yêu cầu thất bại. Vui lòng thử lại.";

      if (status === 401) {
        // The session is gone — drop the in-memory token so subsequent
        // requests don't re-send it. The admin provider listens to the
        // auth event and bounces the user to `/login`.
        setAuthToken(null);
        if (emitAuth) {
          emitAuthEvent({ kind: "unauthorized", url });
        }
      } else if (status === 403) {
        if (emitAuth) {
          emitAuthEvent({ kind: "forbidden", url });
        }
      }

      return Promise.reject(
        new APIError({
          status,
          code,
          message,
          details: envelope?.error,
        }),
      );
    },
  };
}

/**
 * Build an axios instance. Each instance gets its own request and
 * response interceptors — never a singleton.
 */
function buildAxios(
  attachBearer: boolean,
  emitAuth: boolean,
): AxiosInstance {
  const instance = axios.create(baseConfig);

  if (attachBearer) {
    instance.interceptors.request.use((config) => {
      const token = currentToken;
      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
      if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        config.headers.set("X-Request-ID", crypto.randomUUID());
      }
      return config;
    });
  }

  const { onFulfilled, onRejected } = envelopeInterceptor(emitAuth);
  instance.interceptors.response.use(onFulfilled, onRejected);

  return instance;
}

/* ------------------------------------------------------------------ *
 * Public instance — catalog, settings, banners, contact, etc.
 * No bearer header, no auth-event listener.
 * ------------------------------------------------------------------ */
export const publicApiClient = buildAxios(false, false);

/* ------------------------------------------------------------------ *
 * Admin instance — `/admin/*` routes. Bearer header attached, 401
 * listener fires so the auth provider can bounce to `/login`.
 * ------------------------------------------------------------------ */
export const adminApiClient = buildAxios(true, true);

/* ------------------------------------------------------------------ *
 * Backwards-compatible alias. Older modules import `apiClient` and
 * expect automatic envelope unwrap. New code should import
 * `publicApiClient` (the right one for storefront reads) or
 * `adminApiClient` (for admin writes).
 *
 * Defaulted to the public instance so the storefront paths that
 * existed before the split don't accidentally leak the bearer.
 * ------------------------------------------------------------------ */
export const apiClient: AxiosInstance = publicApiClient;

/* ------------------------------------------------------------------ *
 * Envelope helpers — shared by every module below.
 *
 * **Caller MUST pass the axios client as the first argument.** The
 * helpers used to accept a `string` URL as the first argument and
 * silently default to the public client — that fallback was a footgun:
 * any `/admin/*` call written with a string URL hit the public client
 * with no JWT, the backend returned 401, and the auth-event listener
 * bounced the user to `/login`. The string overload has been removed
 * entirely so every admin call has to wire `adminApiClient` in
 * explicitly; TypeScript now catches a missing client at build time.
 * ------------------------------------------------------------------ */

export function unwrap<T>(response: AxiosResponse<ApiSuccessEnvelope<T>>): T {
  return response.data.data;
}

export function unwrapMaybe<T>(response: AxiosResponse<ApiSuccessEnvelope<T>>): T | undefined {
  if (response.status === 204) return undefined;
  return response.data.data;
}

/**
 * Convenience for non-paginated `GET` reads. The caller MUST supply
 * an explicit `AxiosInstance` (`publicApiClient` for catalog reads,
 * `adminApiClient` for admin surface).
 */
export async function get<T>(
  client: AxiosInstance,
  url: string,
  params?: Record<string, unknown>,
): Promise<T> {
  const response = await client.get<ApiSuccessEnvelope<T>>(url, { params });
  return unwrap(response);
}

/**
 * Convenience for `POST` writes. The caller MUST supply an explicit
 * client — typically `adminApiClient` for admin writes.
 */
export async function post<T, B = unknown>(
  client: AxiosInstance,
  url: string,
  body?: B,
): Promise<T> {
  const response = await client.post<ApiSuccessEnvelope<T>>(url, body);
  return unwrap(response);
}

/**
 * Convenience for `PUT` updates.
 */
export async function put<T, B = unknown>(
  client: AxiosInstance,
  url: string,
  body?: B,
): Promise<T> {
  const response = await client.put<ApiSuccessEnvelope<T>>(url, body);
  return unwrap(response);
}

/**
 * Convenience for `PATCH` partial updates.
 */
export async function patch<T, B = unknown>(
  client: AxiosInstance,
  url: string,
  body?: B,
): Promise<T> {
  const response = await client.patch<ApiSuccessEnvelope<T>>(url, body);
  return unwrap(response);
}

/**
 * Convenience for `DELETE` deletes. Returns `true` on a 204 and
 * otherwise returns the unwrapped body (some endpoints acknowledge
 * with a `{ deleted: true }`-style payload).
 */
export async function del<T = unknown>(
  client: AxiosInstance,
  url: string,
): Promise<T | undefined> {
  const response = await client.delete<ApiSuccessEnvelope<T>>(url);
  return unwrapMaybe(response);
}

/**
 * Multipart upload. Used by product images, banner images, and the
 * settings logo / favicon (the backend uses `multipart/form-data` with
 * the file under the `file` field).
 *
 * The caller MUST supply an explicit client (almost always
 * `adminApiClient` for uploads — they're all gated behind `/admin/*`).
 *
 * IMPORTANT: do NOT pass a static `Content-Type: multipart/form-data`
 * header at the call site. axios 1.6+ computes the correct
 * `multipart/form-data; boundary=...` automatically from the `FormData`
 * body, AND overriding the header here wipes the `Authorization`
 * header attached by the admin instance's request interceptor.
 */
export async function upload<T>(
  client: AxiosInstance,
  url: string,
  file: File | Blob,
  fieldName = "file",
): Promise<T> {
  const form = new FormData();
  form.append(fieldName, file);
  const response = await client.post<ApiSuccessEnvelope<T>>(url, form);
  return unwrap(response);
}

export { APIError } from "./errors";
