import { z } from "zod";
import { ProductStatus } from "@/types";

/**
 * Coerce a backend image list into the ordered array of `object_key`
 * values that the backend expects in `image_keys`. The backend now
 * returns `object_key` directly on each image, so we just pluck it.
 * Array index = sort_order, so order is preserved.
 */
export function productImagesToKeys(
  images: { object_key?: string | null }[],
): string[] {
  return images
    .map((img) => img.object_key ?? null)
    .filter((k): k is string => Boolean(k));
}

/**
 * Shared zod schema for the product create / edit form.
 *
 * Used by:
 *
 *  - React Hook Form via `zodResolver`
 *  - Status-page-side validation in the create / edit pages
 *
 * Numeric fields are BIGINT on the wire (no decimals). Money inputs
 * are stored as numbers on the form and re-coerced through a
 * `transform` so empty strings don't trip the validator and
 * non-numeric input is rejected early.
 */

const moneySchema = z
  .union([z.string(), z.number(), z.nan()])
  .transform((value, ctx) => {
    if (typeof value === "number") {
      if (!Number.isFinite(value) || value < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Số tiền không hợp lệ.",
        });
        return z.NEVER;
      }
      return Math.round(value);
    }
    const trimmed = String(value).trim();
    if (trimmed === "") return undefined;
    const parsed = Number(trimmed.replace(/[^\d.-]/g, ""));
    if (!Number.isFinite(parsed) || parsed < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Số tiền không hợp lệ.",
      });
      return z.NEVER;
    }
    return Math.round(parsed);
  });

const optionalMoneySchema = z
  .union([z.string(), z.number(), z.nan()])
  .transform((value, ctx) => {
    if (value === undefined || value === null) return null;
    if (typeof value === "number") {
      if (!Number.isFinite(value) || value < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Số tiền không hợp lệ.",
        });
        return z.NEVER;
      }
      return Math.round(value) === 0 ? null : Math.round(value);
    }
    const trimmed = String(value).trim();
    if (trimmed === "") return null;
    const parsed = Number(trimmed.replace(/[^\d.-]/g, ""));
    if (!Number.isFinite(parsed) || parsed < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Số tiền không hợp lệ.",
      });
      return z.NEVER;
    }
    return Math.round(parsed);
  });

const positiveMoneySchema = moneySchema.refine(
  (value) => value !== undefined && value > 0,
  { message: "Giá bán phải lớn hơn 0." },
);

export const productFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên sản phẩm là bắt buộc.")
    .max(160, "Tên sản phẩm tối đa 160 ký tự."),
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
  price: positiveMoneySchema,
  compare_at: optionalMoneySchema,
  cost: optionalMoneySchema,
  status: z
    .enum([
      ProductStatus.Draft,
      ProductStatus.Active,
      ProductStatus.Archived,
    ] as const)
    .default(ProductStatus.Active),
  /**
   * Optional starting inventory quantity. Only sent on Create;
   * editing inventory happens via /admin/inventory, not here.
   * Defaults to undefined (no inventory row created) — the backfill
   * migration handles legacy rows so we never leave the inventory
   * table in a partial state.
   */
  initial_quantity: z
    .number()
    .int("Số lượng phải là số nguyên.")
    .min(0, "Số lượng ban đầu không được âm.")
    .optional(),
});

export type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at: number | null;
  cost: number | null;
  status: typeof ProductStatus.Active | typeof ProductStatus.Draft | typeof ProductStatus.Archived;
  initial_quantity?: number;
};

/**
 * Coerce a backend `Product` into the editable form shape.
 * Used by the edit page when rehydrating from `GET /products/:id`.
 */
export function productToFormDefaults(product: {
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  compare_at?: number | null;
  cost?: number | null;
  status: typeof ProductStatus.Active | typeof ProductStatus.Draft | typeof ProductStatus.Archived;
}): ProductFormValues {
  return {
    name: product.name ?? "",
    slug: product.slug ?? "",
    description: product.description ?? "",
    price: Number(product.price ?? 0),
    compare_at:
      typeof product.compare_at === "number" && product.compare_at > 0
        ? product.compare_at
        : null,
    cost: typeof product.cost === "number" && product.cost > 0 ? product.cost : null,
    status: product.status ?? ProductStatus.Active,
    initial_quantity: undefined,
  };
}

/**
 * Coerce the form payload into the create / update wire shape.
 * Empty optional money is serialised as `null` (the backend uses
 * `*big.Int` and accepts nullable values).
 */
export function formToCreateInput(values: ProductFormValues): {
  name: string;
  slug: string;
  description: string;
  status: typeof ProductStatus.Active | typeof ProductStatus.Draft | typeof ProductStatus.Archived;
  price: number;
  compare_at: number | null;
  cost: number | null;
  initial_quantity?: number;
} {
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    description: (values.description ?? "").trim(),
    status: values.status,
    price: values.price,
    compare_at: values.compare_at ?? null,
    cost: values.cost ?? null,
    initial_quantity: values.initial_quantity,
  };
}

export function formToUpdateInput(values: ProductFormValues): {
  name: string;
  description: string;
  status: typeof ProductStatus.Active | typeof ProductStatus.Draft | typeof ProductStatus.Archived;
  price: number;
  compare_at: number | null;
  cost: number | null;
  // Optional — caller sets this when the image order has changed.
  // Stays undefined on a non-image edit so the backend leaves the
  // image list untouched.
  image_keys?: string[];
} {
  return {
    name: values.name.trim(),
    description: (values.description ?? "").trim(),
    status: values.status,
    price: values.price,
    compare_at: values.compare_at ?? null,
    cost: values.cost ?? null,
  };
}
