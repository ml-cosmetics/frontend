/**
 * Featured Collection Management Feature.
 *
 * Provides a full CRUD UI for the storefront's "Bộ sưu tập nổi bật"
 * section:
 *   /admin/featured-collections            – list with search, status filter
 *   /admin/featured-collections/new       – create (metadata + cover image)
 *   /admin/featured-collections/:id/edit   – edit (metadata + product picker)
 *
 * Backend APIs (see `lib/api/featured-collections.ts`):
 *   GET    /v1/featured-collections          (public, active only)
 *   GET    /v1/admin/featured-collections    (paginated admin list)
 *   GET    /v1/admin/featured-collections/:id (single, with items)
 *   POST   /v1/admin/featured-collections    (create)
 *   PUT    /v1/admin/featured-collections/:id (update)
 *   DELETE /v1/admin/featured-collections/:id (delete)
 *   PUT    /v1/admin/featured-collections/:id/items (wholesale items replace)
 *
 * Image workflow: upload via the generic `POST /v1/admin/upload`
 * endpoint → get `object_key` → persist on the collection via create/
 * update. The product picker issues `PUT /:id/items` to replace the
 * item list wholesale — ordering is preserved server-side.
 */
export * from "./api";
export * from "./hooks";
export * from "./schema";
export {
  featuredItemToListItem,
  findFeaturedCollectionBySlug,
} from "./utils";

export { FeaturedCollectionListTable } from "./components/table";
export {
  FeaturedCollectionImagePreview,
  type FeaturedCollectionImagePreviewProps,
} from "./components/featured-collection-image-preview";
export {
  buildFeaturedCollectionColumns,
  type FeaturedCollectionActionsArgs,
  type FeaturedCollection,
} from "./components/columns";
export {
  FeaturedCollectionForm,
  type FeaturedCollectionFormProps,
} from "./components/form";
export { FeaturedCollectionBreadcrumbSync } from "./components/featured-collection-breadcrumb-sync";
export {
  ProductPicker,
  SelectedProductList,
  type ProductPickerProps,
  type SelectedProductListProps,
} from "./components/product-picker";