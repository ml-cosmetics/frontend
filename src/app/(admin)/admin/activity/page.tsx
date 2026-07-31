import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ActivityView } from "@/features/activity";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nhật ký hoạt động",
  description: "Theo dõi toàn bộ thay đổi trong hệ thống LuxeOps.",
};

export default function AdminActivityPage() {
  return (
    <main className="flex-1 overflow-auto p-6" role="main">
      <div className="mx-auto max-w-screen-xl space-y-6">
        <PageHeader
          title="Nhật ký hoạt động"
          description="Theo dõi toàn bộ thay đổi trong hệ thống"
        />
        <Suspense fallback={<ViewFallback />}>
          <ActivityView />
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
      aria-label="Đang tải nhật ký hoạt động"
      className="flex flex-col gap-3"
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg bg-white"
          />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-lg bg-surface-container-high" />
      <div className="sr-only">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      </div>
    </div>
  );
}
