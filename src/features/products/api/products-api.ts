import type { AxiosInstance } from "axios";
import { adminApiClient, del, get, post, put } from "@/lib/api/axios";
import { toPageRequest, toQueryString } from "@/lib/utils/pagination";
import type {
  CreateProductInput,
  ID,
  PaginatedList,
  Product,
  ProductImage,
  ProductListItem,
  ProductStatus,
  UpdateProductInput,
} from "@/types";
import type { ApiSuccessEnvelope } from "@/types/api";
/**
 * Typed HTTP client for the product feature.
 *
 * The backend mounts every product endpoint under `/v1/products` on
 * the **public** surface (no JWT) — see `backend/internal/route/v1.go`.
 * Reads from the admin UI also hit the same routes. Image upload /
 * delete require a JWT because the `product_image` admin routes use
 * it; everything else flows through `publicApiClient` (the default
 * instance exported from `lib/api/axios`).
 *
 * Naming follows the brief: thin wrappers around `get`, `post`,
 * `put`, `del` with no inline axios. Errors are normalised to
 * `APIError` by the interceptor before they reach these functions.
 */

export interface ListProductsParams {
  search?: string;
  status?: ProductStatus;
  category_id?: ID;
  /**
   * Out-of-stock tri-state — see `useProductListUrlState`. Backend
   * wires the predicate into the same SQL as the inventory LEFT
   * JOIN so we don't need to filter client-side.
   */
  out_of_stock?: boolean;
  page?: number;
  per_page?: number;
}

export interface ListProductsResult {
  items: ProductListItem[];
  /** Optional summary — only present on the public endpoint. */
  total?: number;
}

/**
 * Counts powering the admin Products tab bar. Returned by
 * `GET /v1/admin/products/status-counts` against the current
 * search / category filter so the badge numbers stay in sync with
 * the active list query.
 *
 * Counts are NOT mutually exclusive — a single product can be
 * `active + out_of_stock`. Render each dimension separately.
 */
export interface ProductStatusCounts {
  total: number;
  active: number;
  draft: number;
  archived: number;
  out_of_stock: number;
}

/**
 * Response shape of `POST /v1/admin/upload` (generic file upload).
 * The backend returns both the opaque `object_key` (which the caller
 * persists on its own resource) and the public `url` (for immediate
 * preview).
 */
export interface UploadFileOutput {
  object_key: string;
  url: string;
  content_type: string;
  size: number;
  original_name: string;
}

export const productsApi = {
  /* ---- Reads ---- */
  list(
    params: ListProductsParams = {},
    client: AxiosInstance = adminApiClient,
  ): Promise<PaginatedList<ProductListItem>> {
    const qs = toQueryString({
      ...toPageRequest(params),
      search: params.search,
      status: params.status,
      category_id: params.category_id,
      out_of_stock:
        params.out_of_stock === undefined ? undefined : String(params.out_of_stock),
    });
    return get<PaginatedList<ProductListItem>>(client, `/products${qs}`);
  },

  /** Counts powering the admin tab bar (Tất cả / Đang bán / ...). */
  listCounts(
    params: ListProductsParams = {},
    client: AxiosInstance = adminApiClient,
  ): Promise<ProductStatusCounts> {
    const qs = toQueryString({
      search: params.search,
      category_id: params.category_id,
    });
    return get<ProductStatusCounts>(
      client,
      `/admin/products/status-counts${qs}`,
    );
  },

  get(
    id: ID,
    client: AxiosInstance = adminApiClient,
  ): Promise<Product> {
    return get<Product>(client, `/products/${id}`);
  },

  listImages(
    id: ID,
    client: AxiosInstance = adminApiClient,
  ): Promise<{ images: ProductImage[] }> {
    return client
      .get<{ data: { id: string; object_key?: string; url?: string; image_url?: string; sort_order?: number }[] }>(
        `/products/${id}/images`,
      )
      .then((response) => ({
        images: (response.data.data ?? []).map((raw) => ({
          id: raw.id,
          object_key: raw.object_key ?? "",
          image_url: raw.url ?? raw.image_url ?? "",
          sort_order: raw.sort_order ?? 0,
        })),
      }));
  },

  /* ---- Writes ---- */
  create(
    input: CreateProductInput,
    client: AxiosInstance = adminApiClient,
  ): Promise<Product> {
    return post<Product, CreateProductInput>(client, "/products", input);
  },

  update(
    id: ID,
    input: UpdateProductInput,
    client: AxiosInstance = adminApiClient,
  ): Promise<Product> {
    return put<Product, UpdateProductInput>(client, `/products/${id}`, input);
  },

  delete(
    id: ID,
    client: AxiosInstance = adminApiClient,
  ): Promise<void> {
    return del<void>(client, `/products/${id}`);
  },

  /**
   * Upload a single file to the generic `POST /v1/admin/upload`
   * endpoint. Returns the storage `object_key` + pre-resolved
   * public `url`. The caller is responsible for persisting the
   * key on a downstream resource (e.g. by PUT-ing the product with
   * `image_keys: [...]`).
   *
   * Accepts an optional `AbortSignal` so the gallery can cancel an
   * in-flight upload (and free the local preview) before it lands.
   *
   * IMPORTANT: we MUST NOT override `Content-Type` with a static
   * `multipart/form-data` string. axios sets the header to
   * `multipart/form-data; boundary=----...` automatically when the
   * body is a `FormData` instance, AND passing a plain `headers`
   * object at the call site in axios 1.6+ wipes the headers that
   * the instance's request interceptor already attached (most
   * importantly `Authorization`). That bug surfaced as a 401 on
   * `/v1/admin/upload` that triggered the auto-logout flow.
   */
  async uploadFile(
    file: File,
    options: { signal?: AbortSignal; client?: AxiosInstance } = {},
  ): Promise<UploadFileOutput> {
    const client = options.client ?? adminApiClient;
    const form = new FormData();
    form.append("file", file);
    const response = await client.post<ApiSuccessEnvelope<UploadFileOutput>>(
      "/admin/upload",
      form,
      { signal: options.signal },
    );
    return response.data.data;
  },

  /**
   * Backwards-compatible alias for `uploadFile`. Older callers
   * (e.g. the legacy `lib/api/products.ts`) used this to mean
   * "upload and attach in one go", but the backend has no such
   * combined endpoint. The admin product-image upload route does
   * NOT exist on the server — uploads go through `/admin/upload`
   * and the returned key is persisted via `update({ image_keys })`.
   *
   * @deprecated Use {@link uploadFile} + a follow-up `update()`.
   */
  async uploadImage(
    _id: ID,
    file: File,
    client: AxiosInstance = adminApiClient,
  ): Promise<UploadFileOutput> {
    return productsApi.uploadFile(file, { client });
  },

  deleteImage(
    id: ID,
    imageId: ID,
    client: AxiosInstance = adminApiClient,
  ): Promise<void> {
    return del<void>(client, `/products/${id}/images/${imageId}`);
  },
};
