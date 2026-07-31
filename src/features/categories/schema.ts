import { z } from "zod";
import type { Category } from "@/types";

/**
 * Shared zod schema for the category create / edit form.
 *
 * Fields: name, slug, description, is_active.
 * Mirrors `Category` domain type from `@/types`.
 */

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên danh mục là bắt buộc.")
    .max(160, "Tên danh mục tối đa 160 ký tự."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug là bắt buộc.")
    .max(200, "Slug tối đa 200 ký tự.")
    .regex(
      /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/,
      "Slug chỉ gồm chữ thường, số và dấu gạch ngang.",
    ),
  description: z
    .string()
    .trim()
    .max(5_000, "Mô tả tối đa 5.000 ký tự.")
    .optional()
    .or(z.literal("")),
  is_active: z.boolean().default(true),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

/**
 * Coerce a backend `Category` into the editable form shape.
 */
export function categoryToFormDefaults(
  category: Category,
): CategoryFormValues {
  return {
    name: category.name ?? "",
    slug: category.slug ?? "",
    description: category.description ?? "",
    is_active: category.is_active ?? true,
  };
}

/**
 * Coerce the form payload into the create / update wire shape.
 */
export function formToCreateInput(
  values: CategoryFormValues,
): {
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
} {
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    description: (values.description ?? "").trim(),
    is_active: values.is_active,
  };
}

export function formToUpdateInput(
  values: CategoryFormValues,
): {
  name: string;
  description: string;
  is_active: boolean;
} {
  return {
    name: values.name.trim(),
    description: (values.description ?? "").trim(),
    is_active: values.is_active,
  };
}
