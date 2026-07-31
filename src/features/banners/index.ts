/**
 * Banner Management Feature.
 *
 * Provides a full CRUD UI for banner management:
 *   /admin/banners         – grid list with status tabs, search, view toggle
 *   /admin/banners/new     – create banner
 *   /admin/banners/:id/edit – edit banner
 *
 * Backend APIs (see `lib/api/banners.ts`):
 *   GET    /banners             (public, read-only)
 *   GET    /admin/banners      (admin list)
 *   GET    /admin/banners/:id  (admin detail)
 *   POST   /admin/banners      (create)
 *   PUT    /admin/banners/:id   (update)
 *   DELETE /admin/banners/:id   (delete)
 *   PATCH  /admin/banners/:id/activate
 *   PATCH  /admin/banners/:id/deactivate
 *
 * Image workflow: upload via the generic `POST /admin/upload` →
 * get `object_key` → store the key as `image_key` on the banner
 * via the create/update PUT.
 */
export * from "./api";
export * from "./hooks";

export { BannerSliderEditor } from "./components/banner-slider-editor";
export { BannerCard } from "./components/banner-card";
export {
  getBannerStatus,
  BANNER_STATUS_FILTERS,
  BANNER_STATUS_LABELS,
  BANNER_STATUS_DESCRIPTIONS,
  type BannerLifecycle,
  type BannerStatusFilter,
  type BannerStatusInfo,
} from "./utils/banner-status";
export { BannerImagePreview, type BannerImagePreviewProps } from "./components/banner-image-preview";
export { buildBannerColumns, type BannerActionsArgs, type Banner } from "./components/columns";

export { BannerForm, type BannerFormProps } from "./components/form";
