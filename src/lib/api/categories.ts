import { del, get, post, put } from "./client";
import { adminApiClient, publicApiClient } from "./axios";
import { toPageRequest, toQueryString } from "../utils/pagination";
import type {
  Category,
  CreateCategoryInput,
  ID,
  PaginatedList,
  UpdateCategoryInput,
} from "@/types";

export interface ListCategoriesParams {
  search?: string;
  parent_id?: ID;
  active?: boolean;
  page?: number;
  per_page?: number;
}

/**
 * Typed client for the category endpoints.
 *
 * The backend mounts the public read endpoints at `/categories` and
 * the admin mutations at the same path but on the admin group (which
 * applies JWT + admin role). Reads go through `publicApiClient`,
 * writes through `adminApiClient`.
 */
export const categoriesApi = {
  list(params: ListCategoriesParams = {}): Promise<PaginatedList<Category>> {
    return get<PaginatedList<Category>>(
      publicApiClient,
      `/categories${toQueryString({ ...toPageRequest(params), search: params.search, parent_id: params.parent_id, active: params.active })}`,
    );
  },

  get(id: ID): Promise<Category> {
    return get<Category>(publicApiClient, `/categories/${id}`);
  },

  create(input: CreateCategoryInput): Promise<Category> {
    return post<Category, CreateCategoryInput>(adminApiClient, "/categories", input);
  },

  update(id: ID, input: UpdateCategoryInput): Promise<Category> {
    return put<Category, UpdateCategoryInput>(adminApiClient, `/categories/${id}`, input);
  },

  delete(id: ID): Promise<void> {
    return del<void>(adminApiClient, `/categories/${id}`);
  },
};