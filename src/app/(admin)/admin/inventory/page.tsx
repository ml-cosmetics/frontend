import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { AdminPageGuard } from "@/components/common/admin-page-guard";
import { InventoryListTable } from "@/features/inventory/components/table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tồn kho",
  description: "Theo dõi và điều chỉnh số lượng sản phẩm trong kho.",
};

export default function AdminInventoryPage() {
  return (
    <main className="flex-1 overflow-auto p-6" role="main">
      <div className="mx-auto max-w-screen-xl space-y-6">
        <PageHeader
          title="Tồn kho"
          description="Theo dõi và điều chỉnh số lượng sản phẩm trong kho."
        />
        <Suspense
          fallback={
            <div
              role="status"
              aria-live="polite"
              aria-label="Đang tải danh sách tồn kho"
              className="grid place-items-center rounded-xl border border-hairline bg-card py-16"
            >
              <Loader2
                className="h-6 w-6 animate-spin text-primary"
                aria-hidden="true"
              />
            </div>
          }
        >
          <AdminPageGuard role="admin">
            <InventoryListTable />
          </AdminPageGuard>
        </Suspense>
      </div>
    </main>
  );
}
