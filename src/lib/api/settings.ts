import { get, put, upload } from "./client";
import { adminApiClient, publicApiClient } from "./axios";
import type { Settings, SettingsUploadOutput, UpdateSettingsInput } from "@/types";

/**
 * Typed client for the settings endpoints. The backend exposes the
 * read endpoint on the public group (`GET /settings`) and the mutating
 * endpoints on the admin group.
 *
 * The logo / favicon fields are returned as resolved URLs by the
 * backend (the `*_key` storage keys are *not* exposed on the wire).
 * The upload endpoints use the generic `POST /admin/upload` endpoint
 * which returns `{ object_key, url, ... }`. We remap `object_key` to
 * `key` to match the `SettingsUploadOutput` shape expected by the hooks.
 */

/** Raw shape returned by POST /admin/upload */
interface UploadRawOutput {
  object_key: string;
  url: string;
}

export const settingsApi = {
  get(): Promise<Settings> {
    return get<Settings>(publicApiClient, "/settings");
  },

  update(input: UpdateSettingsInput): Promise<Settings> {
    return put<Settings, UpdateSettingsInput>(adminApiClient, "/admin/settings", input);
  },

  async uploadLogo(file: File): Promise<SettingsUploadOutput> {
    const raw = await upload<UploadRawOutput>(adminApiClient, "/admin/upload", file);
    return { key: raw.object_key, url: raw.url };
  },

  async uploadFavicon(file: File): Promise<SettingsUploadOutput> {
    const raw = await upload<UploadRawOutput>(adminApiClient, "/admin/upload", file);
    return { key: raw.object_key, url: raw.url };
  },
};