import { get, put } from "./client";
import { adminApiClient, publicApiClient } from "./axios";
import type { ContentSection, UpdateContentInput } from "@/types";

/**
 * Typed client for the website-content endpoints. The backend exposes
 * the read endpoints on the public group:
 *   - GET /content           -> list of every key
 *   - GET /content/:key      -> one section
 * and the write endpoint on the admin group:
 *   - PUT /admin/content/:key
 */
export const contentApi = {
  list(): Promise<{ items: ContentSection[] }> {
    return get<{ items: ContentSection[] }>(publicApiClient, "/content");
  },

  get(key: string): Promise<ContentSection> {
    return get<ContentSection>(publicApiClient, `/content/${encodeURIComponent(key)}`);
  },

  update(key: string, input: UpdateContentInput): Promise<ContentSection> {
    return put<ContentSection, UpdateContentInput>(
      adminApiClient,
      `/admin/content/${encodeURIComponent(key)}`,
      input,
    );
  },
};