/**
 * Frontend inventory constants — kept in sync with the backend's
 * `LowStockThreshold` (see `backend/internal/repository/inventory/const.go`).
 *
 * The backend uses this value to filter the inventory list endpoint
 * by stock status (`stock=low_stock|in_stock|out_of_stock`). When you
 * change the backend constant, mirror it here and re-roll the shared
 * docs in `docs/inventory.md`.
 *
 * TODO: Move both to a shared config service once the backend exposes
 * runtime settings, so the value is config-driven from one source.
 */
export const LOW_STOCK_THRESHOLD = 5;

/**
 * Classify a quantity into a stable inventory stock status. Mirrors
 * the backend repository's WHERE-clause semantics so the FE badge
 * matches the BE-filtered rows.
 */
export type InventoryStockStatus = "in_stock" | "low_stock" | "out_of_stock";

export function classifyStock(quantity: number | null | undefined): InventoryStockStatus {
  if (quantity == null || quantity <= 0) return "out_of_stock";
  if (quantity <= LOW_STOCK_THRESHOLD) return "low_stock";
  return "in_stock";
}
