"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import type {
  InventoryStockFilter,
  InventoryUrlState,
} from "../types/inventory-row";

const DEFAULT_PER_PAGE = 20;
const ALLOWED_SORT_KEYS = new Set([
  "updated_at_desc",
  "quantity_asc",
  "quantity_desc",
  "name_asc",
] as const);
const DEFAULT_STATE: InventoryUrlState = {
  page: 1,
  per_page: DEFAULT_PER_PAGE,
  search: "",
  stock: undefined,
};

export function useInventoryUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo<InventoryUrlState>(() => {
    const page = Number(searchParams?.get("page")) || DEFAULT_STATE.page;
    const per_page = Number(searchParams?.get("per_page")) || DEFAULT_STATE.per_page;
    const search = searchParams?.get("search") ?? "";
    const stockRaw = searchParams?.get("stock");
    const sortRaw = searchParams?.get("sort");

    let stock: InventoryStockFilter = undefined;
    if (stockRaw === "in_stock") stock = "in_stock";
    else if (stockRaw === "low_stock") stock = "low_stock";
    else if (stockRaw === "out_of_stock") stock = "out_of_stock";

    const sort =
      sortRaw && (ALLOWED_SORT_KEYS as Set<string>).has(sortRaw)
        ? (sortRaw as InventoryUrlState["sort"])
        : undefined;

    return {
      page: Number.isFinite(page) && page > 0 ? Math.floor(page) : DEFAULT_STATE.page,
      per_page:
        Number.isFinite(per_page) && per_page > 0
          ? Math.min(100, Math.floor(per_page))
          : DEFAULT_STATE.per_page,
      search,
      stock,
      sort,
    };
  }, [searchParams]);

  const update = useCallback(
    (patch: Partial<InventoryUrlState>) => {
      const next: InventoryUrlState = { ...state, ...patch };
      const params = new URLSearchParams();
      if (next.page > 1) params.set("page", String(next.page));
      if (next.per_page !== DEFAULT_PER_PAGE) params.set("per_page", String(next.per_page));
      if (next.search) params.set("search", next.search);
      if (next.stock !== undefined) params.set("stock", next.stock);
      if (next.sort) params.set("sort", next.sort);
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [state, router, pathname],
  );

  const reset = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  return { state, update, reset };
}
