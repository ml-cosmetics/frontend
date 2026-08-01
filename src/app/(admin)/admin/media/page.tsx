import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { MediaView } from "@/features/media";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thư viện Media",
  description: "Quản lý tài nguyên hình ảnh, video và tài liệu LuxeOps.",
};

export default function AdminMediaPage() {
  return (
    <main className="flex-1 overflow-hidden p-6" role="main">
      <div className="mx-auto flex h-full max-w-screen-2xl flex-col space-y-6">
        <PageHeader
          title="Thư viện Media"
          description="Ảnh sản phẩm, banner, video và tài liệu phục vụ bán hàng."
        />
        <Suspense fallback={<ViewFallback />}>
          <MediaView />
        </Suspense>
      </div>
    </main>
  );
}

function ViewFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải thư viện media"
      className="flex h-[640px] animate-pulse items-center justify-center rounded-lg bg-surface-container-high"
    >
      <div className="flex items-center gap-2 font-mono text-[13px] text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Đang tải thư viện...
      </div>
    </div>
  );
}
