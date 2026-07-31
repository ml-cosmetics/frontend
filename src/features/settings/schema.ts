import { z } from "zod";
import type { Settings, UpdateSettingsInput } from "@/types";

/**
 * Zod schema for the settings form.
 *
 * All fields are optional. Validation rules:
 *   - email    — optional, must be valid email if provided
 *   - phone    — optional string
 *   - URLs     — optional, must be valid URL if provided
 *   - logo_key / favicon_key — uploaded separately; set by the upload
 *     callbacks and included in the submit payload
 */
export const settingsFormSchema = z.object({
  company_name: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: "Email không hợp lệ" },
    ),
  address: z.string().optional().nullable(),
  working_hours: z.string().optional().nullable(),
  facebook_url: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || /^https?:\/\/.+/.test(val), {
      message: "URL không hợp lệ",
    }),
  instagram_url: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || /^https?:\/\/.+/.test(val), {
      message: "URL không hợp lệ",
    }),
  zalo_url: z.string().optional().nullable(),
  messenger_url: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || /^https?:\/\/.+/.test(val), {
      message: "URL không hợp lệ",
    }),
  tiktok_url: z.string().optional().nullable(),
  youtube_url: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || /^https?:\/\/.+/.test(val), {
      message: "URL không hợp lệ",
    }),
  logo_key: z.string().optional().nullable(),
  favicon_key: z.string().optional().nullable(),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
  seo_keywords: z.string().optional().nullable(),
  google_map_embed: z.string().optional().nullable(),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

/**
 * Convert a `Settings` response into the form's default values.
 * URL fields default to empty string for easier editing.
 */
export function settingsToFormDefaults(settings: Settings): SettingsFormValues {
  const out: SettingsFormValues = {
    company_name: settings.company_name ?? null,
    phone: settings.phone ?? null,
    email: settings.email ?? null,
    address: settings.address ?? null,
    working_hours: settings.working_hours ?? null,
    facebook_url: settings.facebook_url ?? null,
    instagram_url: settings.instagram_url ?? null,
    zalo_url: settings.zalo_url ?? null,
    messenger_url: settings.messenger_url ?? null,
    tiktok_url: settings.tiktok_url ?? null,
    youtube_url: settings.youtube_url ?? null,
    logo_key: null,
    favicon_key: null,
    seo_title: settings.seo_title ?? null,
    seo_description: settings.seo_description ?? null,
    seo_keywords: settings.seo_keywords ?? null,
    google_map_embed: settings.google_map_embed ?? null,
  };
  // logo_key/favicon_key are not returned by GET /settings; they come
  // from upload mutations. Default them to null.
  return out;
}

/**
 * Convert form values to `UpdateSettingsInput`.
 * Null/undefined fields are passed as null to explicitly clear them.
 */
export function formToUpdateInput(
  values: SettingsFormValues,
): UpdateSettingsInput {
  return {
    company_name: values.company_name ?? null,
    phone: values.phone ?? null,
    email: values.email ?? null,
    address: values.address ?? null,
    working_hours: values.working_hours ?? null,
    facebook_url: values.facebook_url ?? null,
    instagram_url: values.instagram_url ?? null,
    zalo_url: values.zalo_url ?? null,
    messenger_url: values.messenger_url ?? null,
    tiktok_url: values.tiktok_url ?? null,
    youtube_url: values.youtube_url ?? null,
    logo_key: values.logo_key ?? null,
    favicon_key: values.favicon_key ?? null,
    seo_title: values.seo_title ?? null,
    seo_description: values.seo_description ?? null,
    seo_keywords: values.seo_keywords ?? null,
    google_map_embed: values.google_map_embed ?? null,
  };
}
