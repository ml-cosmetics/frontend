import { del, get, patch, post } from "./client";
import { adminApiClient } from "./axios";
import type {
  ID,
  MediaAsset,
  MediaFolder,
  MediaLibraryStats,
} from "@/types";

/**
 * Media library API — admin surface under `/admin/media`. The backend
 * keeps the canonical asset registry (folders + files), exposes stats
 * for the storage usage card, and supports per-asset metadata edits
 * (alt text, tag) plus the basic delete. Every route here is gated
 * by JWT + admin role, so we always go through `adminApiClient`.
 */
export const mediaApi = {
  folders(): Promise<{ items: MediaFolder[] }> {
    return get<{ items: MediaFolder[] }>(adminApiClient, "/admin/media/folders");
  },

  list(): Promise<{ items: MediaAsset[]; total: number }> {
    return get<{ items: MediaAsset[]; total: number }>(adminApiClient, "/admin/media");
  },

  stats(): Promise<MediaLibraryStats> {
    return get<MediaLibraryStats>(adminApiClient, "/admin/media/stats");
  },

  get(id: ID): Promise<MediaAsset> {
    return get<MediaAsset>(adminApiClient, `/admin/media/${id}`);
  },

  update(
    id: ID,
    input: { alt_text?: string | null; tags?: string[] },
  ): Promise<MediaAsset> {
    return patch<MediaAsset, { alt_text?: string | null; tags?: string[] }>(
      adminApiClient,
      `/admin/media/${id}`,
      input,
    );
  },

  createFolder(input: { name: string; parent_id?: ID | null }): Promise<MediaFolder> {
    return post<MediaFolder, { name: string; parent_id?: ID | null }>(
      adminApiClient,
      "/admin/media/folders",
      input,
    );
  },

  delete(id: ID): Promise<void> {
    return del<void>(adminApiClient, `/admin/media/${id}`);
  },
};