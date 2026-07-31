import { Suspense } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/features/products";
import { fetchProductNameById } from "@/lib/server/product-lookup";

export const dynamic = "force-dynamic";

/**
 * `/admin/products/[id]/edit` — Product Management edit page.
 *
 * Server component for the chrome (header + breadcrumb); the actual
 * `ProductForm` runs on the client and handles loading + error
 * states itself. Wrapped in `<Suspense>` so the dynamic param can
 * resolve without forcing the whole page into CSR.
 *
 * The product's display name is resolved server-side and forwarded
 * to the breadcrumb so the last segment reads `… / Products /
 * Lipstick Rouge` instead of `… / Products / 9c1f…`. If the lookup
 * fails the breadcrumb falls back to the raw ID.
 */
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const productName = await fetchProductNameById(id);
  return (
    <>
      <PageHeader
        eyebrow="Quản lý"
        title="Chỉnh sửa sản phẩm"
        description="Cập nhật thông tin sản phẩm và hình ảnh."
        breadcrumbOverrides={productName ? { [id]: productName } : undefined}
        actions={
          <Button asChild variant="ghost">
            <Link href="/admin/products" prefetch>
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lại</span>
            </Link>
          </Button>
        }
      />

      <div className="text-foreground px-4 pt-6 pb-12 text-[14px] leading-[1.6] md:px-8">
        <Suspense fallback={<EditFallback />}>
          <ProductForm productId={id} />
        </Suspense>
      </div>
    </>
  );
}

function EditFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid place-items-center rounded-xl border border-hairline bg-card py-16"
    >
      <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
    </div>
  );
}
