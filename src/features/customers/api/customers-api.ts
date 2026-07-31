import type { AxiosInstance } from "axios";
import { adminApiClient, del, get, post, put } from "@/lib/api/axios";
import { toPageRequest, toQueryString } from "@/lib/utils/pagination";
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

export const customersApi = {
  list(
    params: ListCustomersParams = {},
    client: AxiosInstance = adminApiClient,
  ): Promise<PaginatedList<Customer>> {
    const qs = toQueryString({ ...toPageRequest(params), search: params.search });
    return get<PaginatedList<Customer>>(client, `/customers${qs}`);
  },

  get(id: ID, client: AxiosInstance = adminApiClient): Promise<Customer> {
    return get<Customer>(client, `/customers/${id}`);
  },

  create(
    input: CreateCustomerInput,
    client: AxiosInstance = adminApiClient,
  ): Promise<Customer> {
    return post<Customer, CreateCustomerInput>(client, "/customers", input);
  },

  update(
    id: ID,
    input: UpdateCustomerInput,
    client: AxiosInstance = adminApiClient,
  ): Promise<Customer> {
    return put<Customer, UpdateCustomerInput>(client, `/customers/${id}`, input);
  },

  delete(id: ID, client: AxiosInstance = adminApiClient): Promise<void> {
    return del<void>(client, `/customers/${id}`);
  },
};
