import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { CustomerForm } from "@/features/customers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thêm khách hàng mới",
  description: "Tạo hồ sơ khách hàng mới.",
};

export default function NewCustomerPage() {
  return (
    <>
      <PageHeader
        eyebrow="Quản lý"
        title="Thêm khách hàng mới"
        description="Tạo hồ sơ khách hàng mới."
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
        <CustomerForm />
      </div>
    </>
  );
}
