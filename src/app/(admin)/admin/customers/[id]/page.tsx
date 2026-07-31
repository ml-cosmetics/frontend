import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { CustomerDetailView } from "@/features/customers";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // We cannot easily fetch the name here without blocking, so we use a generic title
  void params;
  return {
    title: "Chi tiết khách hàng",
    description: "Thông tin và lịch sử mua hàng.",
  };
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div
          role="status"
          aria-live="polite"
          aria-label="Đang tải thông tin khách hàng"
          className="grid h-[60vh] place-items-center"
        >
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
        </div>
      }
    >
      <CustomerDetailView customerId={id} />
    </Suspense>
  );
}
