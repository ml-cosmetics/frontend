import { del, get, patch, post, put } from "./client";
import { adminApiClient, publicApiClient } from "./axios";
import { toPageRequest, toQueryString } from "../utils/pagination";
import type {
  AdjustInventoryInput,
  CreateInventoryInput,
  ID,
  Inventory,
  PaginatedList,
  UpdateInventoryInput,
} from "@/types";

export interface ListInventoryParams {
  product_id?: ID;
  search?: string;
  /**
   * Server-side stock filter. Maps directly to `stock` query param.
   * One of `in_stock` / `low_stock` / `out_of_stock`.
   */
  stock?: "in_stock" | "low_stock" | "out_of_stock";
  /**
   * Sort key (allow-list maintained by the backend):
   *   `updated_at_desc` (default) | `quantity_asc` | `quantity_desc` | `name_asc`
   */
  sort?: "updated_at_desc" | "quantity_asc" | "quantity_desc" | "name_asc";
  page?: number;
  per_page?: number;
}

/**
 * Typed client for the inventory endpoints. Reads are public;
 * mutations are admin-only.
 */
export const inventoryApi = {
  list(params: ListInventoryParams = {}): Promise<PaginatedList<Inventory>> {
    const query = toQueryString({
      ...toPageRequest(params),
      product_id: params.product_id,
      search: params.search,
      stock: params.stock,
      sort: params.sort,
    });
    return get<PaginatedList<Inventory>>(
      publicApiClient,
      `/inventories${query}`,
    );
  },

  get(id: ID): Promise<Inventory> {
    return get<Inventory>(publicApiClient, `/inventories/${id}`);
  },

  getByProduct(productId: ID): Promise<Inventory> {
    return get<Inventory>(publicApiClient, `/inventories/product/${productId}`);
  },

  create(input: CreateInventoryInput): Promise<Inventory> {
    return post<Inventory, CreateInventoryInput>(adminApiClient, "/inventories", input);
  },

  update(id: ID, input: UpdateInventoryInput): Promise<Inventory> {
    return put<Inventory, UpdateInventoryInput>(adminApiClient, `/inventories/${id}`, input);
  },

  delete(id: ID): Promise<void> {
    return del<void>(adminApiClient, `/inventories/${id}`);
  },

  increase(id: ID, input: AdjustInventoryInput): Promise<Inventory> {
    return patch<Inventory, AdjustInventoryInput>(
      adminApiClient,
      `/inventories/${id}/increase`,
      input,
    );
  },

  decrease(id: ID, input: AdjustInventoryInput): Promise<Inventory> {
    return patch<Inventory, AdjustInventoryInput>(
      adminApiClient,
      `/inventories/${id}/decrease`,
      input,
    );
  },

  setQuantity(id: ID, input: AdjustInventoryInput): Promise<Inventory> {
    return patch<Inventory, AdjustInventoryInput>(
      adminApiClient,
      `/inventories/${id}/set-quantity`,
      input,
    );
  },

  bulkAdjust(input: BulkAdjustInventoryInput): Promise<{ items: Inventory[] }> {
    return post<{ items: Inventory[] }, BulkAdjustInventoryInput>(
      adminApiClient,
      "/inventories/bulk-adjust",
      input,
    );
  },
};

export interface BulkAdjustInventoryInput {
  ids: ID[];
  delta: number;
  reason?: string;
}