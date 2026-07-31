import { adminApiClient, del, get, patch, post, put } from "./axios";
import { toPageRequest, toQueryString } from "../utils/pagination";
import type {
  CreateOrderInput,
  ID,
  Order,
  OrderStatus,
  PaginatedList,
  UpdateOrderInput,
} from "@/types";

export interface ListOrdersParams {
  search?: string;
  customer_id?: ID;
  status?: OrderStatus | string;
  page?: number;
  per_page?: number;
}

/**
 * Typed client for the admin order endpoints. All operations use the
 * admin JWT (via `adminApiClient`) since order routes are admin-only.
 * Status transitions are exposed as `POST /orders/:id/{ship,cancel,complete}`.
 */
export const ordersApi = {
  list(params: ListOrdersParams = {}): Promise<PaginatedList<Order>> {
    return get<PaginatedList<Order>>(
      adminApiClient,
      `/orders${toQueryString({ ...toPageRequest(params), search: params.search, customer_id: params.customer_id, status: params.status })}`,
    );
  },

  get(id: ID): Promise<Order> {
    return get<Order>(adminApiClient, `/orders/${id}`);
  },

  create(input: CreateOrderInput): Promise<Order> {
    return post<Order, CreateOrderInput>(adminApiClient, "/orders", input);
  },

  update(id: ID, input: UpdateOrderInput): Promise<Order> {
    return put<Order, UpdateOrderInput>(adminApiClient, `/orders/${id}`, input);
  },

  delete(id: ID): Promise<void> {
    return del<void>(adminApiClient, `/orders/${id}`);
  },

  ship(id: ID): Promise<Order> {
    return patch<Order, Record<string, never>>(adminApiClient, `/orders/${id}/ship`, {});
  },

  cancel(id: ID): Promise<Order> {
    return patch<Order, Record<string, never>>(adminApiClient, `/orders/${id}/cancel`, {});
  },

  complete(id: ID): Promise<Order> {
    return patch<Order, Record<string, never>>(adminApiClient, `/orders/${id}/complete`, {});
  },
};
