import { del, get, post, put } from "./client";
import { adminApiClient } from "./axios";
import { publicApiClient } from "./axios";
import { toPageRequest, toQueryString } from "../utils/pagination";
import type {
  CreateProductInput,
  ID,
  PaginatedList,
  Product,
  ProductImage,
  ProductListItem,
  UpdateProductInput,
} from "@/types";

export interface ListProductsParams {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

/**
 * Response shape of `POST /v1/admin/upload` (generic file upload).
 * The backend returns the opaque `object_key` (which the caller
 * persists on its own resource) and a pre-resolved public `url`
 * (for immediate preview).
 */
export interface ProductUploadOutput {
  object_key: string;
  url: string;
  content_type: string;
  size: number;
  original_name: string;
}

/**
 * Typed client for the product endpoints.
 *
 * Surface split:
 *   - public reads (`/products`, `/products/:id`, `/products/:id/images`)
 *     go through `publicApiClient` (no JWT).
 *   - admin writes (create / update / delete, plus the generic upload
 *     endpoint at `/admin/upload`) go through `adminApiClient` (JWT).
 *
 * NOTE: callers should prefer `features/products/api/products-api.ts`,
 * which exposes the same surface with explicit admin-vs-public
 * awareness; this file is kept for the `ListProductsParams` type
 * re-export used by storefront blocks.
 */
export const productsApi = {
  /* ----- public reads ----- */
  list(params: ListProductsParams = {}): Promise<PaginatedList<ProductListItem>> {
    return get<PaginatedList<ProductListItem>>(
      publicApiClient,
      `/products${toQueryString({ ...toPageRequest(params), search: params.search, status: params.status })}`,
    );
  },

  get(id: ID): Promise<Product> {
    return get<Product>(publicApiClient, `/products/${id}`);
  },

  listImages(id: ID): Promise<{ images: ProductImage[] }> {
    return get<{ images: ProductImage[] }>(publicApiClient, `/products/${id}/images`);
  },

  /* ----- admin writes ----- */
  create(input: CreateProductInput): Promise<Product> {
    return post<Product, CreateProductInput>(adminApiClient, "/products", input);
  },

  update(id: ID, input: UpdateProductInput): Promise<Product> {
    return put<Product, UpdateProductInput>(adminApiClient, `/products/${id}`, input);
  },

  delete(id: ID): Promise<void> {
    return del<void>(adminApiClient, `/products/${id}`);
  },

  /**
   * Upload a file to the generic `POST /v1/admin/upload` endpoint.
   * Returns the storage `object_key` + pre-resolved public `url`.
   * The caller is responsible for persisting the key on a
   * downstream resource (e.g. via `update({ image_keys })`).
   *
   * The previous `POST /v1/products/:id/images` route used here
   * does NOT exist on the backend — every product image upload
   * goes through the generic admin upload, then is attached via
   * `image_keys` on a follow-up create / update.
   */
  uploadImage(_id: ID, file: File): Promise<ProductUploadOutput> {
    const form = new FormData();
    form.append("file", file);
    return post<ProductUploadOutput, FormData>(adminApiClient, "/admin/upload", form);
  },

  deleteImage(id: ID, imageId: ID): Promise<void> {
    return del<void>(adminApiClient, `/products/${id}/images/${imageId}`);
  },
};