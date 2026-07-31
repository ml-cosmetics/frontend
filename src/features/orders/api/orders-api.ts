import type { PaginatedList } from "@/types/api";
import type { CreateOrderInput, Order } from "@/types/domain";
import { ordersApi as baseOrdersApi } from "@/lib/api/orders";

export interface ListOrdersParams {
  search?: string;
  customer_id?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

/**
 * Feature-scoped orders API wrapper.
 * Re-exports from `@/lib/api/orders` (which uses `/orders` under the admin group)
 * and adds a typed `updateStatus` adapter for status-transition convenience.
 */
export const ordersApi = {
  list(params: ListOrdersParams = {}): Promise<PaginatedList<Order>> {
    return baseOrdersApi.list({
      search: params.search,
      customer_id: params.customer_id as never,
      status: params.status,
      page: params.page,
      per_page: params.per_page,
    } as Parameters<typeof baseOrdersApi.list>[0]);
  },

  get(id: string): Promise<Order> {
    return baseOrdersApi.get(id as never);
  },

  create(input: CreateOrderInput): Promise<Order> {
    return baseOrdersApi.create(input);
  },

  ship(id: string): Promise<Order> {
    return baseOrdersApi.ship(id as never);
  },

  cancel(id: string): Promise<Order> {
    return baseOrdersApi.cancel(id as never);
  },

  complete(id: string): Promise<Order> {
    return baseOrdersApi.complete(id as never);
  },

  updateStatus(id: string, status: string): Promise<Order> {
    switch (status) {
      case "shipping":
        return this.ship(id);
      case "cancelled":
        return this.cancel(id);
      case "done":
        return this.complete(id);
      default:
        return Promise.reject(new Error(`Unknown status: ${status}`));
    }
  },
};
