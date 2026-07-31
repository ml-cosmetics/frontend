import type { Metadata } from "next";
import { categoriesApi, productsApi, settingsApi } from "@/lib/api";
import { ProductStatus } from "@/types";
import type { Category, PaginatedList, ProductListItem } from "@/types";
import { SearchResultsView } from "@/features/search/components/search-results-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Public search results route (`/search`).
 *
 * Stitch spec: `b6a2c4eb244a4c5299f0ae01f9e5621a`
 *   — "ML Cosmetics — Kết quả tìm kiếm "Ngọc Bích Xanh"".
 *
 * Server-side reads `?q=<query>` from the URL, fetches the matching
 * active products, and the category list for the tab strip, and
 * hydrates the client view for instant first paint and SSR SEO.
 */
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readSingle(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

function readPositiveInt(value: string | string[] | undefined, fallback: number): number {
  const raw = readSingle(value);
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const q = readSingle(params.q)?.trim();
  try {
    const settings = await settingsApi.get();
    if (q) {
      return {
        title: `Tìm kiếm "${q}"`,
        description: `Kết quả tìm kiếm cho "${q}" tại ML Cosmetics.`,
      };
    }
    return {
      title: "Tìm kiếm",
      description: settings.seo_description ?? "Tìm kiếm sản phẩm ML Cosmetics.",
    };
  } catch {
    return { title: "Tìm kiếm" };
  }
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = readSingle(params.q)?.trim() ?? "";
  const categoryId = readSingle(params.category);
  const page = readPositiveInt(params.page, 1);
  const perPage = 12;

  const [productsResult, categoriesResult] = await Promise.allSettled([
    productsApi.list({
      status: ProductStatus.Active,
      search: q || undefined,
      page,
      per_page: perPage,
    }),
    categoriesApi.list({ active: true, page: 1, per_page: 100 }),
  ]);

  const initialProducts: PaginatedList<ProductListItem> | undefined =
    productsResult.status === "fulfilled" ? productsResult.value : undefined;
  const initialCategories: PaginatedList<Category> | undefined =
    categoriesResult.status === "fulfilled" ? categoriesResult.value : undefined;

  return (
    <SearchResultsView
      initialQuery={q}
      initialCategoryId={categoryId}
      initialPage={page}
      initialProducts={initialProducts}
      initialCategories={initialCategories}
    />
  );
}
