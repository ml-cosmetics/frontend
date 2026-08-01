import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { BannerSliderEditor } from "@/features/banners";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quản lý banner",
  description: "Quản lý banner hiển thị trên trang chủ và các mục quảng cáo.",
};

export default function AdminBannersPage() {
  return (
    <main className="flex-1 overflow-auto p-6" role="main">
      <div className="mx-auto max-w-screen-2xl space-y-6">
        <PageHeader
          title="Quản lý banner"
          description="Xem trước slider, chỉnh sửa thông tin, kéo thả để sắp xếp thứ tự."
        />
        <Suspense fallback={<EditorFallback />}>
          <BannerSliderEditor />
        </Suspense>
      </div>
    </main>
  );
}

function EditorFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải editor banner"
      className="flex flex-col gap-5"
    >
      <div className="h-10 w-72 animate-pulse rounded-lg bg-surface-container-high" />
      <div className="h-10 w-96 animate-pulse rounded-lg bg-surface-container-high" />
      <div className="mx-auto aspect-[4/3] w-full max-w-3xl animate-pulse rounded-xl bg-surface-container-high" />
      <div className="h-40 w-full animate-pulse rounded-2xl bg-surface-container-high" />
    </div>
  );
}
