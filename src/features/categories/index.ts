/**
 * `features/categories` — backoffice category tree.
 *
 * The backend supports a self-referential parent/child hierarchy
 * (depth ≤ 2). The category feature will manage that tree and the
 * order in which categories appear in the storefront.
 */
export { categoriesApi } from "./api";
