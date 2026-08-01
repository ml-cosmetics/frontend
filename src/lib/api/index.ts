/**
 * Public barrel for the API layer. Every feature module imports from
 * here, not from individual files. This keeps the surface small and
 * lets us reorganise internals without breaking feature code.
 */
export { apiClient, APIError, onAuthEvent } from "./client";
export { authApi } from "./auth";
export { productsApi } from "./products";
export { categoriesApi } from "./categories";
export { inventoryApi } from "./inventory";
export { ordersApi } from "./orders";
export { customersApi } from "./customers";
export { bannersApi } from "./banners";
export { featuredCollectionsApi } from "./featured-collections";
export { contentApi } from "./content";
export { settingsApi } from "./settings";
export { dashboardApi } from "./dashboard";
export { reportsApi } from "./reports";
export { notificationsApi } from "./notifications";
export { shippingApi } from "./shipping";
export { permissionsApi } from "./permissions";
export { costsApi } from "./costs";
export { activityApi } from "./activity";
export { accountApi } from "./account";
export { mediaApi } from "./media";
export { customerAnalyticsApi } from "./customer-analytics";

export type { ListProductsParams } from "./products";
export type { ListCategoriesParams } from "./categories";
export type { ListInventoryParams } from "./inventory";
export type { ListOrdersParams } from "./orders";
export type { ListCustomersParams } from "./customers";
