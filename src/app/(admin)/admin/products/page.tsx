import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ProductListView } from "@/features/products/components/product-list-view";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sản phẩm",
  description: "Quản lý toàn bộ sản phẩm trên website.",
};

export default function AdminProductsPage() {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          aria-live="polite"
          aria-label="Đang tải danh sách sản phẩm"
          className="grid h-[60vh] place-items-center"
        >
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
        </div>
      }
    >
      <ProductListView />
    </Suspense>
  );
}
