import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { CustomerForm } from "@/features/customers";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  void params;
  return {
    title: "Chỉnh sửa khách hàng",
    description: "Cập nhật thông tin khách hàng.",
  };
}

export default async function EditCustomerPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <>
      <PageHeader
        eyebrow="Quản lý"
        title="Chỉnh sửa khách hàng"
        description="Cập nhật thông tin khách hàng."
        actions={
          <Button
            asChild
            variant="ghost"
            className="h-10 rounded-lg bg-transparent px-4 text-[14px]"
          >
            <Link href="/admin/customers" prefetch>
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lại</span>
            </Link>
          </Button>
        }
      />
      <div className="text-foreground px-4 pt-6 pb-12 text-[14px] leading-[1.6] md:px-8">
        <Suspense fallback={<EditFallback />}>
          <CustomerForm customerId={id} />
        </Suspense>
      </div>
    </>
  );
}

function EditFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="border-hairline bg-card grid place-items-center rounded-xl border-[1px] py-16"
    >
      <Loader2 className="text-primary h-6 w-6 animate-spin" aria-hidden="true" />
    </div>
  );
}
