"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Global error boundary. Mounted by `app/error.tsx` — Next.js will
 * route any uncaught error in the React tree here. The friendly
 * fallback gives the user a "retry" button and a "back to home" link.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, this is where you'd send the error to Sentry
    // or whatever observability backend the project uses.
    // eslint-disable-next-line no-console
    console.error("[root-error-boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md rounded-xl border border-hairline bg-card px-6 py-12 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
        </div>
        <h1 className="text-[18px] font-semibold leading-[1.3] text-foreground">
          Đã xảy ra lỗi
        </h1>
        <p className="mt-2 text-[14px] leading-[1.6] text-muted-foreground">
          {error.message || "Vui lòng thử lại hoặc quay lại trang chủ."}
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-[12px] text-muted-foreground">
            Mã lỗi: {error.digest}
          </p>
        )}
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Thử lại
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Về trang chủ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
