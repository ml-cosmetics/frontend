import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "@/features/categories/components/form";

export const dynamic = "force-dynamic";

export default function NewCategoryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Quản lý"
        title="Tạo danh mục mới"
        description="Thêm một danh mục mới để phân loại sản phẩm."
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
        <CategoryForm />
      </div>
    </>
  );
}
