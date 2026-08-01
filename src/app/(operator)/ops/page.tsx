import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { DashboardPage } from "@/features/dashboard";

export const dynamic = "force-dynamic";

/**
 * `/ops` — the OperOps public-side operator console.
 *
 * Per the canonical mapping, this Stitch screen
 * (`2dc99bb612994188883debba291ee9ac`) is shared with the admin
 * dashboard: the design is byte-identical, so we reuse the existing
 * `DashboardPage` client component from `@/features/dashboard`
 * verbatim — zero duplication, zero divergence.
 *
 * The only difference is the surrounding chrome: this route lives in
 * the `(operator)` group, which mounts the dark Monolith sidebar +
 * topbar without the admin auth gate (OperOps is a public-facing
 * control plane).
 */
export const metadata: Metadata = {
  title: "Dashboard",
  description: "OperOps — Dashboard of ML Cosmetics operations.",
};

export default function OpsPage() {
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
