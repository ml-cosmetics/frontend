import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ContentPage } from "@/features/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nội dung",
  description: "Quản lý nội dung trên website",
};

export default function AdminContentPage() {
  return (
    <main className="flex-1 overflow-auto p-6" role="main">
      <div className="mx-auto max-w-screen-xl space-y-6">
        <PageHeader
          title="Nội dung"
          description="Quản lý các mục nội dung hiển thị trên website."
        />
        <Suspense fallback={<PageFallback />}>
          <ContentPage />
        </Suspense>
      </div>
    </main>
  );
}

function PageFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải nội dung"
      className="grid place-items-center rounded-xl border border-hairline bg-card py-16"
    >
      <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
    </div>
  );
}
