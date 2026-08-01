import type { Metadata } from "next";
import { ProductsList } from "@/components/storefront/products-list";
import { categoriesApi, productsApi, settingsApi } from "@/lib/api";
import type { Category, PaginatedList, ProductListItem } from "@/types";
import { ProductStatus } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Server-side search-param helpers.
 */
type SearchParamsPromise = Promise<Record<string, string | string[] | undefined>>;

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
  searchParams: SearchParamsPromise;
}): Promise<Metadata> {
  const params = await searchParams;
  const search = readSingle(params.search);
  const categoryId = readSingle(params.category);

  try {
    const settings = await settingsApi.get();
    const base =
      settings.seo_title ?? settings.company_name ?? "ML Cosmetics";
    const baseDesc =
      settings.seo_description ??
      "Khám phá toàn bộ sản phẩm ML Cosmetics — tuyển tập Aura Rose, son dưỡng Dior và vòng tay ngọc Jadeite.";
    if (!search && !categoryId) {
      return {
        title: `${base} · Sản phẩm`,
        description: baseDesc,
      };
    }
    const parts = [];
    if (search) parts.push(`tìm kiếm "${search}"`);
    if (categoryId) parts.push("theo danh mục");
    return {
      title: `${base} · ${parts.join(" ")}`,
      description: baseDesc,
    };
  } catch {
    return { title: "Sản phẩm" };
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParamsPromise;
}) {
  const params = await searchParams;
  const search = readSingle(params.search);
  const categoryId = readSingle(params.category);
  const page = readPositiveInt(params.page, 1);

  // Always pull a generous list of products and full categories.
  // We rely on the client component to refetch with filters.
  const [productsResult, categoriesResult] = await Promise.allSettled([
    productsApi.list({
      status: ProductStatus.Active,
      search,
      page,
      per_page: 12,
    }),
    categoriesApi.list({ active: true, page: 1, per_page: 100 }),
  ]);

  const initialProducts: PaginatedList<ProductListItem> | undefined =
    productsResult.status === "fulfilled" ? productsResult.value : undefined;
  const initialCategories: PaginatedList<Category> | undefined =
    categoriesResult.status === "fulfilled" ? categoriesResult.value : undefined;

  return (
    <ProductsList
      initialCategoryId={categoryId}
      initialSearch={search}
      initialPage={page}
      initialProducts={initialProducts}
      initialCategories={initialCategories}
    />
  );
}
