import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { PermissionsView } from "@/features/permissions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Phân quyền",
  description: "Quản lý vai trò và quyền truy cập cho nhân viên LuxeOps.",
};

export default function AdminPermissionsPage() {
  return (
    <main className="flex-1 overflow-auto p-6" role="main">
      <div className="mx-auto max-w-screen-xl space-y-6">
        <PageHeader
          title="Phân quyền"
          description="Quản lý vai trò và quyền truy cập cho nhân viên."
        />
        <Suspense fallback={<ViewFallback />}>
          <PermissionsView />
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
      aria-label="Đang tải phân quyền"
      className="flex flex-col gap-3"
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[88px] animate-pulse rounded bg-white"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="h-96 animate-pulse rounded bg-white lg:col-span-4" />
        <div className="h-96 animate-pulse rounded bg-white lg:col-span-8" />
      </div>
      <div className="sr-only">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      </div>
    </div>
  );
}