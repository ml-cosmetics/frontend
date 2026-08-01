/**
 * Canonical wire-format helpers for the backend REST API.
 *
 * The Go backend wraps every successful response in `{"data": ...}` and
 * every failed response in `{"error": {"code": "...", "message": "..."}}`
 * via the go-platform responsekit. The shapes here mirror those 1:1.
 *
 * Keep this file as the only place where the envelope types live. Every
 * API client module imports from here so the frontend cannot drift from
 * the wire format.
 */

/**
 * Successful response envelope. The backend always returns
 * `{ "data": <T> }` for non-204 responses.
 */
export interface ApiSuccessEnvelope<T> {
  data: T;
}

/**
 * Error response envelope. The backend always returns
 * `{ "error": { "code": "INVALID_ARGUMENT", "message": "..." } }`
 * for failed responses (any non-2xx status code except 204).
 */
export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
  };
}

/**
 * Well-known error codes that the backend may return. Generic codes
 * (`INTERNAL`, `INVALID_ARGUMENT`, `NOT_FOUND`, `UNAUTHORIZED`, …)
 * come from the go-platform errkit. Domain-specific codes (e.g.
 * `SLUG_TAKEN`, `INVENTORY_INSUFFICIENT`) are defined in the
 * api-specification document.
 *
 * Marked as a string-literal union so any unknown code still compiles
 * (we narrow it as `ApiErrorCode & string` at runtime).
 */
export type ApiErrorCode =
  // errkit core codes
  | "INTERNAL"
  | "INVALID_ARGUMENT"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "UNAVAILABLE"
  // domain-specific codes from the API spec
  | "AUTH_INVALID_CREDENTIALS"
  | "AUTH_ACCOUNT_DISABLED"
  | "AUTH_LOCKED"
  | "VALIDATION_FAILED"
  | "ORDER_NOT_FOUND"
  | "ORDER_NOT_DRAFT"
  | "ORDER_INVALID_STATE"
  | "INVENTORY_INSUFFICIENT"
  | "MEDIA_REFERENCED"
  | "SLUG_TAKEN"
  | "PAYMENT_OVER_LIMIT"
  | "OPTIMISTIC_LOCK_FAILED"
  | "UPLOAD_TOO_LARGE"
  | "CUSTOMER_HAS_ORDERS"
  // any other code string we haven't enumerated yet
  | (string & {});

/**
 * The backend pagination block. Every list endpoint returns this
 * shape under `data.pagination` (the responsekit wraps the full
 * envelope, so the *outer* shape is `{ data: { items: T[],
 * pagination: Pagination } }`).
 */
export interface Pagination {
  limit: number;
  offset: number;
  has_next: boolean;
  has_previous: boolean;
  page: number;
  total_pages: number;
  /** Backend omits total when it can't compute it cheaply. */
  total?: number | null;
}

/**
 * Generic list shape returned by every paginated endpoint.
 */
export interface PaginatedList<T> {
  items: T[];
  pagination: Pagination;
}

/**
 * Response shape of the generic `POST /v1/admin/upload` endpoint.
 * The backend stores the file under `object_key` (an opaque storage
 * key) and returns the pre-resolved public `url` for immediate
 * preview. Callers persist `object_key` on their own resource
 * (banner, product image, etc.) via the corresponding PUT.
 */
export interface UploadFileOutput {
  object_key: string;
  url: string;
  content_type: string;
  size: number;
  original_name: string;
}

/**
 * Backs the `page` / `per_page` query params on every list endpoint.
 * The backend maps `page` to `offset = (page - 1) * per_page`.
 */
export interface PageRequest {
  page?: number;
  per_page?: number;
}
