import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Breadcrumb } from "@/components/storefront/breadcrumb";
import { ProductDetailStitch } from "@/components/storefront/product-detail-stitch";
import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { productsApi, settingsApi } from "@/lib/api";
import { APIError } from "@/lib/api";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function resolveSlug(slug: string): Promise<Product | null> {
  try {
    const candidates = await productsApi.list({ page: 1, per_page: 100 });
    const exact = candidates.items.find(
      (item) => item.slug === slug || item.id === slug,
    );
    if (!exact) return null;
    return productsApi.get(exact.id);
  } catch (error) {
    if (error instanceof APIError && error.isNotFound) return null;
    throw error;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await resolveSlug(slug);
    if (!product) return { title: "Không tìm thấy sản phẩm" };
    const settings = await settingsApi.get();
    const brand = settings.seo_title ?? settings.company_name ?? "ML Cosmetics";
    // Detail API returns image objects as `{ id, url }` (no
    // `image_url` key) — coerce into the same shape the metadata
    // helper expects.
    const firstImage = product.images?.[0];
    const imageUrl =
      (firstImage as { url?: string; image_url?: string } | undefined)?.url ??
      (firstImage as { image_url?: string } | undefined)?.image_url;
    return {
      title: product.name,
      description:
        product.description?.slice(0, 160) ??
        settings.seo_description ??
        `${product.name} — tuyển tập Aura Rose tại ${brand}.`,
      openGraph: {
        title: product.name,
        description: product.description?.slice(0, 160) ?? undefined,
        images: imageUrl ? [{ url: imageUrl }] : undefined,
      },
    };
  } catch {
    return { title: "Sản phẩm" };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await resolveSlug(slug).catch(() => null);

  if (!product) {
    return (
      <Container size="xl" className="py-16">
        <EmptyState
          title="Sản phẩm không tồn tại"
          description="Sản phẩm bạn đang tìm có thể đã được đổi tên hoặc ngừng kinh doanh."
          action={
            <Button asChild variant="outline">
              <Link href="/products">
                <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                Quay lại danh sách sản phẩm
              </Link>
            </Button>
          }
        />
      </Container>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-6 py-8">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          ...(product.category?.name
            ? [
                {
                  label: product.category.name,
                  href: `/products?category=${product.category.slug}`,
                },
              ]
            : [{ label: "Sản phẩm", href: "/products" }]),
          { label: product.name },
        ]}
      />

      <ProductDetailStitch initialProduct={product} />
    </div>
  );
}