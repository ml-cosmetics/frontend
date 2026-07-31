import { z } from "zod";
import type { Banner, CreateBannerInput, UpdateBannerInput } from "@/types";

export const bannerFormSchema = z
  .object({
    title: z.string().min(1, "Tiêu đề là bắt buộc"),
    subtitle: z.string().optional().nullable(),
    image_key: z.string().min(1, "Hình ảnh là bắt buộc"),
    image_url: z.string().optional(),
    link: z.string().url("URL không hợp lệ").optional().nullable().or(z.literal("")),
    position: z.coerce.number().int().min(0, "Vị trí phải >= 0"),
    is_active: z.boolean(),
    starts_at: z.string().optional().nullable(),
    ends_at: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.starts_at && data.ends_at) {
        return data.starts_at <= data.ends_at;
      }
      return true;
    },
    {
      message: "Ngày bắt đầu phải trước ngày kết thúc",
      path: ["ends_at"],
    },
  );

export type BannerFormValues = z.infer<typeof bannerFormSchema>;

export function bannerToFormDefaults(banner: Banner): BannerFormValues {
  return {
    title: banner.title,
    subtitle: banner.subtitle ?? null,
    image_key: banner.image_key,
    image_url: banner.image_url,
    link: banner.link ?? "",
    position: banner.position,
    is_active: banner.is_active,
    starts_at: banner.starts_at ?? null,
    ends_at: banner.ends_at ?? null,
  };
}

export function formToCreateInput(values: BannerFormValues): CreateBannerInput {
  return {
    title: values.title,
    subtitle: values.subtitle ?? null,
    image_key: values.image_key,
    link: values.link || null,
    position: values.position,
    is_active: values.is_active,
    starts_at: values.starts_at || null,
    ends_at: values.ends_at || null,
  };
}

export function formToUpdateInput(values: BannerFormValues): UpdateBannerInput {
  return {
    title: values.title,
    subtitle: values.subtitle ?? null,
    image_key: values.image_key,
    link: values.link || null,
    position: values.position,
    is_active: values.is_active,
    starts_at: values.starts_at || null,
    ends_at: values.ends_at || null,
  };
}
