import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { CustomerAnalyticsView } from "@/features/customer-analytics";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Phân tích khách hàng",
  description: "Hành vi khách hàng trên website và hiệu quả kênh liên hệ LuxeOps.",
};

export default function AdminCustomerAnalyticsPage() {
  return (
    <main className="flex-1 overflow-auto p-6" role="main">
      <div className="mx-auto max-w-screen-xl space-y-6">
        <PageHeader
          title="Phân tích khách hàng"
          description="Hành vi khách hàng trên website và hiệu quả kênh liên hệ"
        />
        <Suspense fallback={<ViewFallback />}>
          <CustomerAnalyticsView />
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
      aria-label="Đang tải phân tích khách hàng"
      className="flex flex-col gap-3"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-lg bg-white"
          />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-lg bg-surface-container-high" />
      <div className="sr-only">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      </div>
    </div>
  );
}
