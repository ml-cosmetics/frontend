import { del, get, patch, post, put } from "./client";
import { adminApiClient, publicApiClient } from "./axios";
import type {
  Banner,
  BannerPublic,
  CreateBannerInput,
  ID,
  UpdateBannerInput,
  UploadFileOutput,
} from "@/types";
import type { AxiosInstance } from "axios";

/**
 * Typed client for the banner endpoints. The backend exposes two
 * surfaces: a public `GET /banners` (only active, scheduled banners)
 * and the admin CRUD on `/admin/banners`.
 *
 * On the admin side, the `image_key` is opaque — it has to be
 * uploaded first via the generic `POST /admin/upload` endpoint
 * (multipart). The returned `object_key` is then persisted on the
 * banner via the update PUT.
 */
export const bannersApi = {
  /* ----- public ----- */
  listPublic(): Promise<{ items: BannerPublic[] }> {
    return get<{ items: BannerPublic[] }>(publicApiClient, "/banners");
  },

  /* ----- admin ----- */
  list(): Promise<{ items: Banner[] }> {
    return get<{ items: Banner[] }>(adminApiClient, "/admin/banners");
  },

  get(id: ID): Promise<Banner> {
    return get<Banner>(adminApiClient, `/admin/banners/${id}`);
  },

  create(input: CreateBannerInput): Promise<Banner> {
    return post<Banner, CreateBannerInput>(adminApiClient, "/admin/banners", input);
  },

  update(id: ID, input: UpdateBannerInput): Promise<Banner> {
    return put<Banner, UpdateBannerInput>(adminApiClient, `/admin/banners/${id}`, input);
  },

  delete(id: ID): Promise<void> {
    return del<void>(adminApiClient, `/admin/banners/${id}`);
  },

  activate(id: ID): Promise<Banner> {
    return patch<Banner, Record<string, never>>(
      adminApiClient,
      `/admin/banners/${id}/activate`,
      {},
    );
  },

  deactivate(id: ID): Promise<Banner> {
    return patch<Banner, Record<string, never>>(
      adminApiClient,
      `/admin/banners/${id}/deactivate`,
      {},
    );
  },

  /**
   * Upload an image to the generic `POST /v1/admin/upload` endpoint.
   * Returns the storage `object_key` + public `url`; the caller
   * persists the key on the banner via a follow-up `update()`.
   *
   * IMPORTANT: we MUST NOT override `Content-Type` here. axios
   * derives `multipart/form-data; boundary=...` from the `FormData`
   * body and clears the `Authorization` header the admin instance's
   * request interceptor just attached.
   */
  async upload(
    file: File,
    options: { signal?: AbortSignal; client?: AxiosInstance } = {},
  ): Promise<UploadFileOutput> {
    const client = options.client ?? adminApiClient;
    const form = new FormData();
    form.append("file", file);
    const response = await client.post<{ data: UploadFileOutput }>(
      "/admin/upload",
      form,
      { signal: options.signal },
    );
    return response.data.data;
  },
};