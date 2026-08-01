import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/common/page-header";
import { OrderDetailView } from "@/features/orders/components/order-detail-view";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Đơn hàng #${id.slice(0, 8)}` };
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <>
      <PageHeader
        eyebrow="Quản lý"
        title={`Đơn hàng #${id.slice(0, 8)}…`}
        description="Chi tiết đơn hàng"
      />
      <div className="px-4 py-6 md:px-8">
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
          }
        >
          <OrderDetailView orderId={id} />
        </Suspense>
      </div>
    </>
  );
}
