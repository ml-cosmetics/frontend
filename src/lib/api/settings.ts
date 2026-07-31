import { get, post, put } from "./client";
import { adminApiClient, publicApiClient } from "./axios";
import type { Settings, SettingsUploadOutput, UpdateSettingsInput } from "@/types";

/**
 * Typed client for the settings endpoints. The backend exposes the
 * read endpoint on the public group (`GET /settings`) and the mutating
 * endpoints on the admin group.
 *
 * The logo / favicon fields are returned as resolved URLs by the
 * backend (the `*_key` storage keys are *not* exposed on the wire).
 * The upload endpoints return a `{ key, url }` pair that the admin
 * form can then save back into the settings via `update`.
 */
export const settingsApi = {
  get(): Promise<Settings> {
    return get<Settings>(publicApiClient, "/settings");
  },

  update(input: UpdateSettingsInput): Promise<Settings> {
    return put<Settings, UpdateSettingsInput>(adminApiClient, "/admin/settings", input);
  },

  uploadLogo(file: File): Promise<SettingsUploadOutput> {
    const form = new FormData();
    form.append("file", file);
    return post<SettingsUploadOutput, FormData>(adminApiClient, "/admin/settings/logo", form);
  },

  uploadFavicon(file: File): Promise<SettingsUploadOutput> {
    const form = new FormData();
    form.append("file", file);
    return post<SettingsUploadOutput, FormData>(
      adminApiClient,
      "/admin/settings/favicon",
      form,
    );
  },
};