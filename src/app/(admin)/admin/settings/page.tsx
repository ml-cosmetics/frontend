import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { SettingsForm } from "@/features/settings/components/form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cài đặt",
  description: "Quản lý cài đặt trang web",
};

export default function AdminSettingsPage() {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          aria-live="polite"
          aria-label="Đang tải cài đặt"
          className="grid h-[60vh] place-items-center"
        >
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
        </div>
      }
    >
      <SettingsForm />
    </Suspense>
  );
}
