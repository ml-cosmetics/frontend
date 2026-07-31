/**
 * Thin re-export of the low-level inventory API so hooks can import
 * from a consistent feature-internal path.
 */
export { inventoryApi } from "@/lib/api/inventory";
export type { ListInventoryParams } from "@/lib/api/inventory";
