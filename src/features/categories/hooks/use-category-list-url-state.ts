"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { ListCategoriesParams } from "@/lib/api/categories";

/**
 * `useCategoryListUrlState` — keeps search / active / page in sync
 * with the URL.
 *
 * Example URL shape:
 *   /admin/categories?page=2&search=lip&active=true
 */
export interface CategoryListUrlState {
  page: number;
  per_page: number;
  search: string;
  active: boolean | undefined;
}

const DEFAULT_PER_PAGE = 20;
const DEFAULT_STATE: CategoryListUrlState = {
  page: 1,
  per_page: DEFAULT_PER_PAGE,
  search: "",
  active: undefined,
};

export function useCategoryListUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo<CategoryListUrlState>(() => {
    const page = Number(searchParams?.get("page")) || DEFAULT_STATE.page;
    const per_page = Number(searchParams?.get("per_page")) || DEFAULT_STATE.per_page;
    const search = searchParams?.get("search") ?? "";
    const activeRaw = searchParams?.get("active");
    let active: boolean | undefined = undefined;
    if (activeRaw === "true") active = true;
    else if (activeRaw === "false") active = false;
    // `null` means "all" (no filter) — leave as `undefined`.

    return {
      page: Number.isFinite(page) && page > 0 ? Math.floor(page) : DEFAULT_STATE.page,
      per_page:
        Number.isFinite(per_page) && per_page > 0
          ? Math.min(100, Math.floor(per_page))
          : DEFAULT_STATE.per_page,
      search,
      active,
    };
  }, [searchParams]);

  const update = useCallback(
    (patch: Partial<CategoryListUrlState>) => {
      const next: CategoryListUrlState = {
        ...state,
        ...patch,
      };
      const params = new URLSearchParams();
      if (next.page > 1) params.set("page", String(next.page));
      if (next.per_page !== DEFAULT_PER_PAGE) params.set("per_page", String(next.per_page));
      if (next.search) params.set("search", next.search);
      if (next.active !== undefined) params.set("active", String(next.active));
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [state, router, pathname],
  );

  const reset = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const toQueryParams = useMemo<ListCategoriesParams>(
    () => ({
      page: state.page,
      per_page: state.per_page,
      search: state.search || undefined,
      active: state.active,
    }),
    [state.page, state.per_page, state.search, state.active],
  );

  return { state, update, reset, queryParams: toQueryParams };
}
