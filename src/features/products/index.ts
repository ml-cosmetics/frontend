/**
 * Feature: products
 * ----------------------------------------------------------------------
 * The products feature owns the typed HTTP module, React Query hooks,
 * schema, and the three admin pages (list / new / edit). Every piece
 * here is feature-scoped — nothing leaks into `lib/api` other than
 * the axios client itself.
 *
 * Module layout:
 *   ./api/             — typed HTTP client
 *   ./hooks/           — React Query hooks
 *   ./components/      — UI building blocks (table, form, gallery)
 *   ./schema.ts        — shared zod schema
 */

export { productsApi } from "./api";
export type {
  ListProductsParams,
  ListProductsResult,
} from "./api/products-api";

export {
  useProductList,
  useProduct,
  useProductImages,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useUploadProductImage,
  useDeleteProductImage,
  useProductListUrlState,
  useProductFormState,
} from "./hooks";

export {
  StatusBadge,
} from "./components/status-badge";

export {
  buildProductColumns,
  type ProductListRow,
} from "./components/columns";

export { ProductListTable } from "./components/table";
export type { ProductListTableProps } from "./components/table";

export { ProductForm } from "./components/form";
export type { ProductFormProps } from "./components/form";

export { ProductImageGallery } from "./components/gallery";
export type { ProductImageGalleryProps } from "./components/gallery";

export {
  productFormSchema,
  productToFormDefaults,
  formToCreateInput,
  formToUpdateInput,
  type ProductFormValues,
} from "./schema";
