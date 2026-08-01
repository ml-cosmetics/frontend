/**
 * Typed API for the category feature.
 *
 * Thin re-export of `lib/api/categories.ts` so category hooks can
 * import from a single consistent path.
 */
export { categoriesApi } from "@/lib/api/categories";
export type {
  ListCategoriesParams,
} from "@/lib/api/categories";
