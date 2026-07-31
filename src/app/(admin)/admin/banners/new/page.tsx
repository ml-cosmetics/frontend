import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { BannerForm } from "@/features/banners";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tạo Banner",
};

export default function AdminBannerNewPage() {
  return (
    <main className="flex-1 overflow-auto p-6" role="main">
      <div className="mx-auto max-w-screen-xl space-y-6">
        <PageHeader
          title="Tạo Banner"
          description="Tạo banner mới để hiển thị trên trang chủ."
        />
        <Suspense fallback={<EditFallback />}>
          <BannerForm />
        </Suspense>
      </div>
    </main>
  );
}

function EditFallback() {
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
