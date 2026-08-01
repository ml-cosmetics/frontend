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
  return {
    company_name: settings.company_name ?? "",
    phone: settings.phone ?? "",
    email: settings.email ?? "",
    address: settings.address ?? "",
    working_hours: settings.working_hours ?? "",
    facebook_url: settings.facebook_url ?? "",
    instagram_url: settings.instagram_url ?? "",
    zalo_url: settings.zalo_url ?? "",
    messenger_url: settings.messenger_url ?? "",
    tiktok_url: settings.tiktok_url ?? "",
    youtube_url: settings.youtube_url ?? "",
    logo_key: undefined,
    favicon_key: undefined,
    seo_title: settings.seo_title ?? "",
    seo_description: settings.seo_description ?? "",
    seo_keywords: settings.seo_keywords ?? "",
    google_map_embed: settings.google_map_embed ?? "",
  };
}

/**
 * Convert form values to `UpdateSettingsInput`.
 * Null/undefined fields are passed as null to explicitly clear them.
 */
export function formToUpdateInput(
  values: SettingsFormValues,
): UpdateSettingsInput {
  const cleanStr = (val?: string | null) => {
    if (!val) return null;
    const trimmed = val.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  return {
    company_name: cleanStr(values.company_name),
    phone: cleanStr(values.phone),
    email: cleanStr(values.email),
    address: cleanStr(values.address),
    working_hours: cleanStr(values.working_hours),
    facebook_url: cleanStr(values.facebook_url),
    instagram_url: cleanStr(values.instagram_url),
    zalo_url: cleanStr(values.zalo_url),
    messenger_url: cleanStr(values.messenger_url),
    tiktok_url: cleanStr(values.tiktok_url),
    youtube_url: cleanStr(values.youtube_url),
    logo_key: values.logo_key === undefined ? undefined : (values.logo_key ?? ""),
    favicon_key: values.favicon_key === undefined ? undefined : (values.favicon_key ?? ""),
    seo_title: cleanStr(values.seo_title),
    seo_description: cleanStr(values.seo_description),
    seo_keywords: cleanStr(values.seo_keywords),
    google_map_embed: cleanStr(values.google_map_embed),
  };
}
