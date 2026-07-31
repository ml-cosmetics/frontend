import type { ApiErrorCode } from "@/types";

/**
 * `APIError` is the canonical error type the API layer throws. Every
 * axios interceptor below converts `AxiosError` into this shape so the
 * rest of the app never has to deal with axios-rejection objects.
 *
 * Carries enough metadata to surface a meaningful message in the UI
 * (via Sonner toasts) and to discriminate on `status` for redirect
 * logic (e.g. 401 → kick the user out of the admin section).
 */
export class APIError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details: unknown;

  constructor(args: {
    status: number;
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  }) {
    super(args.message);
    this.name = "APIError";
    this.status = args.status;
    this.code = args.code;
    this.details = args.details;
  }

  /** True when the request was rejected because the session expired. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** True when the server explicitly forbids the request (CORS / role). */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /** True when a 4xx error was caused by a client-side validation issue. */
  get isValidation(): boolean {
    return this.status === 400 || this.status === 422;
  }

  /** True when the request hit the rate limiter. */
  get isRateLimited(): boolean {
    return this.status === 429;
  }

  /** True when the resource was not found. */
  get isNotFound(): boolean {
    return this.status === 404;
  }

  /** True when the server returned a 5xx error. */
  get isServer(): boolean {
    return this.status >= 500;
  }
}
