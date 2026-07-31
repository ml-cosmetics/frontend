import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Global 404 page. Rendered by Next.js when no route matches the
 * URL. Stays consistent with the rest of the chrome (brand-mark
 * header) so the page looks intentional.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            M
          </span>
          <span>ML Cosmetics</span>
        </Link>
      </header>
      <main className="container flex flex-1 items-center justify-center">
        <div className="max-w-md rounded-xl border border-hairline bg-card px-6 py-12 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-primary">
            404
          </p>
          <h1 className="mt-2 text-[18px] font-semibold leading-[1.3] text-foreground">
            Trang không tồn tại
          </h1>
          <p className="mt-2 text-[14px] leading-[1.6] text-muted-foreground">
            Đường dẫn bạn vừa truy cập không có trên hệ thống. Hãy quay lại trang chủ
            hoặc sử dụng thanh điều hướng.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Về trang chủ</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
