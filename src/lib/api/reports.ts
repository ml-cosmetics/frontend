import { get } from "./client";
import { adminApiClient } from "./axios";
import type {
  LowStockOutput,
  RecentOrdersOutput,
  TopProductsOutput,
  TopCustomersOutput,
} from "@/types";

/**
 * Typed client for the read-only report endpoints. The backend
 * exposes three endpoints today: top products, low stock, and recent
 * orders. All return a flat `{ items: [...] }` shape. Every route
 * is admin-only.
 */
export const reportsApi = {
  topProducts(): Promise<TopProductsOutput> {
    return get<TopProductsOutput>(adminApiClient, "/admin/reports/top-products");
  },

  lowStock(): Promise<LowStockOutput> {
    return get<LowStockOutput>(adminApiClient, "/admin/reports/low-stock");
  },

  recentOrders(): Promise<RecentOrdersOutput> {
    return get<RecentOrdersOutput>(adminApiClient, "/admin/reports/recent-orders");
  },

  topCustomers(limit: number = 5): Promise<TopCustomersOutput> {
    return get<TopCustomersOutput>(adminApiClient, `/admin/reports/top-customers?limit=${limit}`);
  },
};