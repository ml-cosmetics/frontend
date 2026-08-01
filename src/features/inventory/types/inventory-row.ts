/**
 * Inventory row type matching the backend `inventory.GetOutput` shape.
 *
 * The backend service enriches each inventory row with the product's
 * name, thumbnail, price, and category so the admin table can render
 * without additional round-trips.
 *
 * This alias reuses the canonical `Inventory` interface from
 * `types/domain.ts` so feature-internal code can import from a
 * feature-local path without reaching into shared types. Wire strings
 * (snake_case) on `Inventory` match the backend directly, so no
 * transform is needed.
 */
import type { Inventory } from "@/types";
export type InventoryRow = Inventory;

/**
 * Stock status derived from quantity.
 * Matches the `StockStatus` union in stock-badge.tsx.
 */
export type InventoryStockStatus = "in_stock" | "low_stock" | "out_of_stock";

/**
 * Filter values for the inventory list page.
 */
export type InventoryStockFilter = InventoryStockStatus | undefined;

/**
 * Full URL state shape for the inventory list.
 */
export interface InventoryUrlState {
  page: number;
  per_page: number;
  search: string;
  stock: InventoryStockFilter;
  sort?: "updated_at_desc" | "quantity_asc" | "quantity_desc" | "name_asc";
}
