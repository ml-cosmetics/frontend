import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { CustomerListView } from "@/features/customers/components/customer-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Khách hàng",
  description: "Quản lý thông tin và lịch sử mua hàng.",
};

export default function AdminCustomersPage() {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          aria-live="polite"
          aria-label="Đang tải danh sách khách hàng"
          className="grid h-[60vh] place-items-center"
        >
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
        </div>
      }
    >
      <CustomerListView />
    </Suspense>
  );
}
