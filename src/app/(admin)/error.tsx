"use client";

import { ErrorState } from "@/components/common/error-state";

/**
 * Route-level error boundary for the admin section. Mirrors the
 * rest of the app's error UX (alert card + retry).
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 px-6 py-12">
      <ErrorState error={error} onRetry={reset} title="Không tải được trang quản trị" />
    </div>
  );
}
