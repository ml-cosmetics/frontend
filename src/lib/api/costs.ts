import { del, get, patch, post } from "./client";
import { adminApiClient } from "./axios";
import type {
  Cost,
  CostStats,
  CreateCostInput,
  ID,
  UpdateCostInput,
} from "@/types";

/**
 * Costs / expenses API — admin surface under `/admin/costs`. The
 * backend projects costs in BIGINT VND and keeps the operator
 * surface read-mostly (mutation only via admin form / Excel import).
 */
export const costsApi = {
  list(): Promise<{ items: Cost[] }> {
    return get<{ items: Cost[] }>(adminApiClient, "/admin/costs");
  },

  stats(): Promise<CostStats> {
    return get<CostStats>(adminApiClient, "/admin/costs/stats");
  },

  get(id: ID): Promise<Cost> {
    return get<Cost>(adminApiClient, `/admin/costs/${id}`);
  },

  create(input: CreateCostInput): Promise<Cost> {
    return post<Cost, CreateCostInput>(adminApiClient, "/admin/costs", input);
  },

  update(id: ID, input: UpdateCostInput): Promise<Cost> {
    return patch<Cost, UpdateCostInput>(adminApiClient, `/admin/costs/${id}`, input);
  },

  delete(id: ID): Promise<void> {
    return del<void>(adminApiClient, `/admin/costs/${id}`);
  },
};