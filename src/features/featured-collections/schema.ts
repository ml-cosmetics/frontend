import { z } from "zod";
import type {
  CreateFeaturedCollectionInput,
  FeaturedCollection,
  FeaturedCollectionLayout,
  UpdateFeaturedCollectionInput,
} from "@/types";

/** Layouts the backend accepts. Matches domain.FeaturedCollectionLayout. */
export const FEATURED_COLLECTION_LAYOUTS = ["bento", "grid"] as const;

export const featuredCollectionFormSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  subtitle: z.string().optional().nullable(),
  image_key: z.string().min(1, "Hình ảnh là bắt buộc"),
  image_url: z.string().optional(),
  layout: z.enum(FEATURED_COLLECTION_LAYOUTS),
  is_active: z.boolean(),
  sort_order: z.coerce.number().int().min(0, "Vị trí phải >= 0"),
});

export type FeaturedCollectionFormValues = z.infer<typeof featuredCollectionFormSchema>;

export function featuredCollectionToFormDefaults(
  c: FeaturedCollection,
): FeaturedCollectionFormValues {
  return {
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle ?? null,
    image_key: c.image_key,
    image_url: c.image_url,
    layout: c.layout,
    is_active: c.is_active,
    sort_order: c.sort_order,
  };
}

export function formToCreateInput(
  values: FeaturedCollectionFormValues,
): CreateFeaturedCollectionInput {
  return {
    slug: values.slug || undefined,
    title: values.title,
    subtitle: values.subtitle ?? null,
    image_key: values.image_key,
    layout: values.layout as FeaturedCollectionLayout,
    is_active: values.is_active,
    sort_order: values.sort_order,
  };
}

export function formToUpdateInput(
  values: FeaturedCollectionFormValues,
): UpdateFeaturedCollectionInput {
  return {
    slug: values.slug || undefined,
    title: values.title,
    subtitle: values.subtitle ?? null,
    image_key: values.image_key,
    layout: values.layout as FeaturedCollectionLayout,
    is_active: values.is_active,
    sort_order: values.sort_order,
  };
}