import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/features/products";

export const dynamic = "force-dynamic";

/**
 * `/admin/products/new` — Product Management create page.
 *
 * The form is feature-scoped so the page is just a header + the
 * client form. The back button uses `next/link`; if the form is
 * dirty the unsaved-changes guard prompts before navigating away.
 */
export default function NewProductPage() {
  return (
    <>
      <PageHeader
        eyebrow="Quản lý"
        title="Thêm sản phẩm mới"
        description="Tạo sản phẩm — điền thông tin cơ bản rồi thêm hình ảnh ở bước tiếp theo."
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
        <ProductForm />
      </div>
    </>
  );
}
