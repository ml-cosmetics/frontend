"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { ProductStatus } from "@/types";
import type { ID } from "@/types";
import type { ListProductsParams } from "../api";

/**
 * `useProductListUrlState` — keeps search / status / category /
 * out_of_stock / page in sync with the URL. All other filters fall
 * back to defaults.
 *
 * Refresh-safe: shallow URL updates (`router.replace`) avoid
 * stacking browser history entries.
 *
 * Example URL shape:
 *   /admin/products?page=2&search=jade&status=active&category_id=…
 *   /admin/products?out_of_stock=true
 */
export interface ProductListUrlState {
  page: number;
  per_page: number;
  search: string;
  status: ProductStatus | undefined;
  category_id: ID | undefined;
  /**
   * Out-of-stock filter — tri-state:
   * - true: only products with `inventories.quantity = 0`
   * - false: only products with inventory > 0
   * - undefined: no filter applied
   *
   * Stored as the URL string "out_of_stock=true|false|0|1".
   */
  out_of_stock: boolean | undefined;
}

const DEFAULT_PER_PAGE = 20;
const DEFAULT_STATE: ProductListUrlState = {
  page: 1,
  per_page: DEFAULT_PER_PAGE,
  search: "",
  status: undefined,
  category_id: undefined,
  out_of_stock: undefined,
};

function parseStatus(raw: string | null): ProductStatus | undefined {
  if (!raw) return undefined;
  if (raw === ProductStatus.Active) return ProductStatus.Active;
  if (raw === ProductStatus.Draft) return ProductStatus.Draft;
  if (raw === ProductStatus.Archived) return ProductStatus.Archived;
  return undefined;
}

function parseCategoryId(raw: string | null): ID | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  return trimmed ? trimmed : undefined;
}

function parseOutOfStock(raw: string | null): boolean | undefined {
  if (raw === null) return undefined;
  if (raw === "true" || raw === "1") return true;
  if (raw === "false" || raw === "0") return false;
  return undefined;
}

function stringifyOutOfStock(v: boolean | undefined): string | null {
  if (v === true) return "true";
  if (v === false) return "false";
  return null;
}

export function useProductListUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo<ProductListUrlState>(() => {
    const page = Number(searchParams?.get("page")) || DEFAULT_STATE.page;
    const per_page = Number(searchParams?.get("per_page")) || DEFAULT_STATE.per_page;
    const search = searchParams?.get("search") ?? "";
    const status = parseStatus(searchParams?.get("status") ?? null);
    const category_id = parseCategoryId(searchParams?.get("category_id") ?? null);
    const out_of_stock = parseOutOfStock(searchParams?.get("out_of_stock"));
    return {
      page: Number.isFinite(page) && page > 0 ? Math.floor(page) : DEFAULT_STATE.page,
      per_page:
        Number.isFinite(per_page) && per_page > 0
          ? Math.min(100, Math.floor(per_page))
          : DEFAULT_STATE.per_page,
      search,
      status,
      category_id,
      out_of_stock,
    };
  }, [searchParams]);

  const update = useCallback(
    (patch: Partial<ProductListUrlState>) => {
      const next: ProductListUrlState = {
        ...state,
        ...patch,
      };
      const params = new URLSearchParams();
      if (next.page > 1) params.set("page", String(next.page));
      if (next.per_page !== DEFAULT_PER_PAGE) params.set("per_page", String(next.per_page));
      if (next.search) params.set("search", next.search);
      if (next.status) params.set("status", next.status);
      if (next.category_id) params.set("category_id", next.category_id);
      const oosStr = stringifyOutOfStock(next.out_of_stock);
      if (oosStr) params.set("out_of_stock", oosStr);
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [state, router, pathname],
  );

  const reset = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const queryParams = useMemo<ListProductsParams>(
    () => ({
      page: state.page,
      per_page: state.per_page,
      search: state.search || undefined,
      status: state.status,
      category_id: state.category_id,
      out_of_stock: state.out_of_stock,
    }),
    [state.page, state.per_page, state.search, state.status, state.category_id, state.out_of_stock],
  );

  return { state, update, reset, queryParams };
}

