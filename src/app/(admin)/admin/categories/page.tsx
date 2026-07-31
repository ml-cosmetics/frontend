import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { CategoryListView } from "@/features/categories/components/category-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Danh mục",
  description: "Quản lý danh mục sản phẩm.",
};

export default function AdminCategoriesPage() {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          aria-live="polite"
          aria-label="Đang tải danh sách danh mục"
          className="grid h-[60vh] place-items-center"
        >
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
        </div>
      }
    >
      <CategoryListView />
    </Suspense>
  );
}
