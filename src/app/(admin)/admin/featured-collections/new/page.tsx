import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { FeaturedCollectionForm } from "@/features/featured-collections";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tạo Bộ sưu tập nổi bật",
};

export default function AdminFeaturedCollectionsNewPage() {
  return (
    <main className="flex-1 overflow-auto p-6" role="main">
      <div className="mx-auto max-w-screen-xl space-y-6">
        <PageHeader
          title="Tạo Bộ sưu tập nổi bật"
          description="Tạo bộ sưu tập mới để hiển thị trên trang chủ."
        />
        <Suspense fallback={<FormFallback />}>
          <FeaturedCollectionForm />
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