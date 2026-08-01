import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { BannerForm } from "@/features/banners";
import type { ID } from "@/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Chỉnh sửa Banner #${id}` };
}

export default async function AdminBannerEditPage({ params }: Props) {
  const { id } = await params;
  if (!id || id === "new") notFound();
  return (
    <main className="flex-1 overflow-auto p-6" role="main">
      <div className="mx-auto max-w-screen-xl space-y-6">
        <PageHeader
          title="Chỉnh sửa Banner"
          description="Cập nhật thông tin banner."
        />
        <Suspense fallback={<EditFallback />}>
          <BannerForm bannerId={id as ID} />
        </Suspense>
      </div>
    </main>
  );
}

function EditFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải biểu mẫu"
      className="grid place-items-center rounded-xl border border-hairline bg-card py-16"
    >
      <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
    </div>
  );
}
