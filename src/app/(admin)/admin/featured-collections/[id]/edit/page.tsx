import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import {
  FeaturedCollectionForm,
  FeaturedCollectionBreadcrumbSync,
} from "@/features/featured-collections";
import type { ID } from "@/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Chỉnh sửa Bộ sưu tập #${id}` };
}

export default async function AdminFeaturedCollectionsEditPage({ params }: Props) {
  const { id } = await params;
  if (!id || id === "new") notFound();
  return (
    <main className="flex-1 overflow-auto p-6" role="main">
      <div className="mx-auto max-w-screen-xl space-y-6">
        {/* Resolves the collection ID to its `title` on the client and
         * pushes the friendly label into the breadcrumb store. The
         * admin endpoint requires a JWT that lives in localStorage so
         * this is intentionally a client-side hook (see the component
         * docstring for details). */}
        <FeaturedCollectionBreadcrumbSync collectionId={id} />
        <PageHeader
          title="Chỉnh sửa Bộ sưu tập nổi bật"
          description="Cập nhật thông tin bộ sưu tập và danh sách sản phẩm."
        />
        <Suspense fallback={<FormFallback />}>
          <FeaturedCollectionForm collectionId={id as ID} />
        </Suspense>
      </div>
    </main>
  );
}

function FormFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải biểu mẫu"
      className="grid place-items-center rounded-xl border border-hairline bg-card py-16"
    >
      <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
    </div>
  );
}