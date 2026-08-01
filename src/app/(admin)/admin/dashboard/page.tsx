import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { DashboardPage } from "@/features/dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Tổng quan vận hành ML Cosmetics.",
};
  
/**
 * `/admin/dashboard` route — wraps the client-side `DashboardPage`
 * with a Monolith dark fallback while data is loading.
 */
export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading dashboard"
          className="grid h-[60vh] place-items-center"
        >
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
        </div>
      }
    >
      <DashboardPage />
    </Suspense>
  );
}
