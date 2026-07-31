import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { NotificationsView } from "@/features/notifications";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thông báo",
  description: "Trung tâm thông báo hệ thống LuxeOps.",
};

export default function AdminNotificationsPage() {
  return (
    <main className="flex-1 overflow-auto p-6" role="main">
      <div className="mx-auto max-w-screen-xl space-y-6">
        <PageHeader
          title="Thông báo"
          description="Trung tâm thông báo hệ thống LuxeOps."
        />
        <Suspense fallback={<ViewFallback />}>
          <NotificationsView />
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
      aria-label="Đang tải thông báo"
      className="flex flex-col gap-3"
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[100px] animate-pulse rounded-lg bg-white"
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