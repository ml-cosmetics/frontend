import { del, get, post, put } from "./client";
import { adminApiClient, publicApiClient } from "./axios";
import { toPageRequest, toQueryString } from "../utils/pagination";
import type {
  CreateCustomerInput,
  Customer,
  ID,
  PaginatedList,
  UpdateCustomerInput,
} from "@/types";

export interface ListCustomersParams {
  search?: string;
  page?: number;
  per_page?: number;
}

/**
 * Typed client for the customer endpoints. The backend exposes these
 * on the public group (no auth) so the admin UI can read and write
 * without a separate admin namespace. Reads go through
 * `publicApiClient`, writes through `adminApiClient`.
 */
export const customersApi = {
  list(params: ListCustomersParams = {}): Promise<PaginatedList<Customer>> {
    return get<PaginatedList<Customer>>(
      publicApiClient,
      `/customers${toQueryString({ ...toPageRequest(params), search: params.search })}`,
    );
  },

  get(id: ID): Promise<Customer> {
    return get<Customer>(publicApiClient, `/customers/${id}`);
  },

  create(input: CreateCustomerInput): Promise<Customer> {
    return post<Customer, CreateCustomerInput>(adminApiClient, "/customers", input);
  },

  update(id: ID, input: UpdateCustomerInput): Promise<Customer> {
    return put<Customer, UpdateCustomerInput>(adminApiClient, `/customers/${id}`, input);
  },

  delete(id: ID): Promise<void> {
    return del<void>(adminApiClient, `/customers/${id}`);
  },
};