import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { FeaturedCollectionListTable } from "@/features/featured-collections";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bộ sưu tập nổi bật",
  description: "Quản lý các bộ sưu tập nổi bật hiển thị trên trang chủ.",
};

export default function AdminFeaturedCollectionsPage() {
  return (
    <main className="flex-1 overflow-auto p-6" role="main">
      <div className="mx-auto max-w-screen-xl space-y-6">
        <PageHeader
          title="Bộ sưu tập nổi bật"
          description="Cấu hình các bộ sưu tập xuất hiện trong mục 'Bộ sưu tập nổi bật' trên trang chủ."
        />
        <Suspense fallback={<ListFallback />}>
          <FeaturedCollectionListTable />
        </Suspense>
      </div>
    </main>
  );
}

function ListFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải danh sách bộ sưu tập"
      className="flex flex-col gap-3"
    >
      <div className="h-12 animate-pulse rounded-xl bg-surface-container-high" />
      <div className="h-96 animate-pulse rounded-xl bg-surface-container-high" />
      <div className="sr-only">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      </div>
    </div>
  );
}