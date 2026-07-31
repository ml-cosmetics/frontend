import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { AccountView } from "@/features/account";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân",
  description: "Quản lý thông tin và cài đặt tài khoản LuxeOps.",
};

export default function AdminAccountPage() {
  return (
    <main className="flex-1 overflow-auto p-6" role="main">
      <div className="mx-auto max-w-screen-xl space-y-6">
        <PageHeader
          title="Hồ sơ cá nhân"
          description="Quản lý thông tin và cài đặt tài khoản của bạn."
        />
        <Suspense fallback={<ViewFallback />}>
          <AccountView />
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
      aria-label="Đang tải hồ sơ cá nhân"
      className="flex flex-col gap-3"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-4">
          <div className="h-96 animate-pulse rounded-lg bg-surface-container-high" />
        </div>
        <div className="lg:col-span-8">
          <div className="h-[640px] animate-pulse rounded-lg bg-white" />
        </div>
      </div>
      <div className="sr-only">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      </div>
    </div>
  );
}
