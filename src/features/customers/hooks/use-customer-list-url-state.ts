"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { ListCustomersParams } from "../api";

export interface CustomerListUrlState {
  page: number;
  per_page: number;
  search: string;
}

const DEFAULT_PER_PAGE = 20;
const DEFAULT_STATE: CustomerListUrlState = {
  page: 1,
  per_page: DEFAULT_PER_PAGE,
  search: "",
};

export function useCustomerListUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo<CustomerListUrlState>(() => {
    const page = Number(searchParams?.get("page")) || DEFAULT_STATE.page;
    const per_page = Number(searchParams?.get("per_page")) || DEFAULT_STATE.per_page;
    const search = searchParams?.get("search") ?? "";
    return {
      page: Number.isFinite(page) && page > 0 ? Math.floor(page) : DEFAULT_STATE.page,
      per_page:
        Number.isFinite(per_page) && per_page > 0
          ? Math.min(100, Math.floor(per_page))
          : DEFAULT_STATE.per_page,
      search,
    };
  }, [searchParams]);

  const update = useCallback(
    (patch: Partial<CustomerListUrlState>) => {
      const next: CustomerListUrlState = {
        ...state,
        ...patch,
      };
      const params = new URLSearchParams();
      if (next.page > 1) params.set("page", String(next.page));
      if (next.per_page !== DEFAULT_PER_PAGE) params.set("per_page", String(next.per_page));
      if (next.search) params.set("search", next.search);
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [state, router, pathname],
  );

  const toQueryParams = useMemo<ListCustomersParams>(
    () => ({
      page: state.page,
      per_page: state.per_page,
      search: state.search || undefined,
    }),
    [state.page, state.per_page, state.search],
  );

  return { state, update, queryParams: toQueryParams };
}
