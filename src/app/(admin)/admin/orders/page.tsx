import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { OrderListView } from "@/features/orders/components/order-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Đơn hàng",
  description: "Quản lý tất cả đơn hàng từ Messenger, Zalo, Instagram và đơn tạo thủ công.",
};

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          aria-live="polite"
          aria-label="Đang tải danh sách đơn hàng"
          className="grid h-[60vh] place-items-center"
        >
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
        </div>
      }
    >
      <OrderListView />
    </Suspense>
  );
}
