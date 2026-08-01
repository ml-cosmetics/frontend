import { Suspense } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "@/features/categories/components/form";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <>
      <PageHeader
        eyebrow="Quản lý"
        title="Chỉnh sửa danh mục"
        description="Cập nhật thông tin danh mục."
        actions={
          <Button asChild variant="ghost">
            <Link href="/admin/categories" prefetch>
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lại</span>
            </Link>
          </Button>
        }
      />

      <div className="px-4 pb-12 pt-6 md:px-8">
        <Suspense fallback={<EditFallback />}>
          <CategoryForm categoryId={id} />
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
