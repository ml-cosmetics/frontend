"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Suspense } from "react";
import { Eye, EyeOff, Lock, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APIError } from "@/lib/api";
import { ADMIN_HOME_PATH, useAdminAuth } from "@/lib/auth";
import { RedirectIfAuthenticated } from "@/components/common/redirect-if-authenticated";
import { cn } from "@/lib/utils/cn";

/**
 * Admin login page.
 *
 * Two-column layout (Stitch):
 *
 *   ┌────────────────────┬────────────────────┐
 *   │ brand panel        │ form               │
 *   │ - logo / tagline   │ - username         │
 *   │ - decorative copy  │ - password + show  │
 *   │                    │ - remember         │
 *   │                    │ - submit           │
 *   └────────────────────┴────────────────────┘
 *
 * Brand panel collapses below `lg`; the form stacks full width on
 * mobile. The brand panel is `aria-hidden` because the duplicate
 * copy is decorative — the form announces itself via its accessible
 * name.
 *
 * `useSearchParams()` requires a Suspense boundary on the route; we
 * wrap the form in one so Next.js can render the shell statically.
 *
 * Accessibility:
 *   - username input auto-focuses on mount
 *   - password has a visibility toggle with `aria-pressed`
 *   - errors carry `role="alert"` and `aria-live="polite"`
 *   - the submit button renders an accessible name and a spinner
 *   - the form has `aria-labelledby="login-title"`
 *
 * State management:
 *   - React Hook Form + zod for client validation
 *   - the auth call goes through `useAdminAuth().login()`
 */

const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,32}$/;

const loginSchema = z.object({
  username: z
    .string({ required_error: "Tên đăng nhập là bắt buộc." })
    .trim()
    .min(1, "Tên đăng nhập là bắt buộc.")
    .regex(
      USERNAME_REGEX,
      "Tên đăng nhập chỉ gồm chữ, số, dấu chấm, gạch dưới, gạch ngang (3–32 ký tự).",
    ),
  password: z
    .string({ required_error: "Mật khẩu là bắt buộc." })
    .min(1, "Mật khẩu là bắt buộc."),
  remember: z.boolean().default(true),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// `useSearchParams()` forces the route into dynamic rendering so
// Next.js doesn't attempt a static prerender of the form.
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <RedirectIfAuthenticated redirectTo={ADMIN_HOME_PATH}>
      <div className="mx-auto grid min-h-screen w-full max-w-[1280px] grid-cols-1 lg:grid-cols-2">
        <LoginBrandPanel />
        <LoginFormSection />
      </div>
    </RedirectIfAuthenticated>
  );
}

/* ------------------------------------------------------------------ *
 * Brand panel
 * ------------------------------------------------------------------ */

function LoginBrandPanel() {
  return (
    <aside
      aria-hidden="true"
      className="relative hidden flex-col justify-between overflow-hidden border-r border-hairline bg-primary p-12 text-primary-foreground lg:flex"
    >
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)]" />
      <header className="relative z-10 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-base font-bold">
          M
        </span>
        <span className="text-[18px] font-medium leading-[1.4] tracking-[0.02em]">ML Cosmetics</span>
      </header>

      <div className="relative z-10 max-w-md space-y-6">
        <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold uppercase leading-[1.4] tracking-[0.05em]">
          Aura Vénus · Dashboard
        </span>
        <h1 className="text-balance text-[40px] font-semibold leading-[1.2] tracking-[-0.02em] xl:text-[64px] xl:font-bold xl:leading-[1.1] xl:tracking-[-0.04em]">
          Vận hành cửa hàng &amp; quản lý đơn hàng
        </h1>
        <p className="text-pretty text-[18px] font-normal leading-[1.6] text-primary-foreground/80">
          Đăng nhập để quản lý sản phẩm, đơn hàng, banner khuyến mãi,
          nội dung trang và cấu hình thương hiệu — tất cả ở một nơi duy nhất.
        </p>
      </div>

      <footer className="relative z-10 text-[12px] font-semibold uppercase leading-[1.4] tracking-[0.05em] text-primary-foreground/70">
        © 2026 ML Cosmetics. Mọi quyền được bảo lưu.
      </footer>
    </aside>
  );
}

/* ------------------------------------------------------------------ *
 * Form section
 * ------------------------------------------------------------------ */

function LoginFormSection() {
  return (
    <section className="flex flex-1 items-center justify-center bg-surface p-6 sm:p-10 lg:p-16">
      <div className="w-full max-w-md">
        <div className="mb-6 text-[14px] font-medium leading-[1.4] tracking-[0.02em] text-foreground lg:hidden">
          ML Cosmetics
        </div>

        <Card className="rounded-xl border-hairline bg-card shadow-[0_10px_15px_-3px_rgba(0,0,0,0.04),0_4px_6px_-2px_rgba(0,0,0,0.02)]">
          <CardHeader className="space-y-2">
            <CardTitle
              id="login-title"
              className="text-[32px] font-semibold leading-[1.3] text-foreground"
            >
              Đăng nhập quản trị
            </CardTitle>
            <CardDescription className="text-[14px] font-normal leading-[1.6] text-muted-foreground">
              Sử dụng tài khoản quản trị được cấp để truy cập dashboard.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2">
            <Suspense fallback={<LoginFormFallback />}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-[14px] font-normal leading-[1.6] text-muted-foreground">
          Quay lại{" "}
          <Link href="/" className="font-medium text-primary hover:underline">
            trang cửa hàng
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Form
 * ------------------------------------------------------------------ */

function LoginForm() {
  const { login } = useAdminAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") ?? ADMIN_HOME_PATH;

  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<APIError | Error | null>(null);

  const {
    register,
    handleSubmit,
    setFocus,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "", remember: true },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const remember = watch("remember");

  // Auto-focus the username field on mount.
  React.useEffect(() => {
    setFocus("username");
  }, [setFocus]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      await login({
        username: values.username,
        password: values.password,
        remember: values.remember,
      });
      router.replace(next);
    } catch (cause) {
      const wrapped =
        cause instanceof APIError
          ? cause
          : cause instanceof Error
            ? cause
            : new Error("Đăng nhập thất bại. Vui lòng thử lại.");
      setError(wrapped);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="space-y-5"
      aria-labelledby="login-title"
    >
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-3 rounded-lg border-hairline border-destructive/30 bg-destructive/5 px-4 py-3"
        >
          <span
            aria-hidden="true"
            className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-destructive/10 font-semibold text-destructive"
          >
            !
          </span>
          <div className="space-y-1 text-[14px] font-normal leading-[1.6]">
            <p className="font-semibold text-destructive">Đăng nhập thất bại</p>
            <p className="text-destructive/90">{describeLoginError(error)}</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="username" className="text-[14px] font-medium leading-[1.4] tracking-[0.02em]">Tên đăng nhập</Label>
        <div className="relative">
          <User
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="username"
            type="text"
            inputMode="text"
            autoComplete="username"
            placeholder="admin"
            aria-invalid={Boolean(errors.username) || undefined}
            aria-describedby={errors.username ? "username-error" : undefined}
            disabled={submitting}
            className={cn("rounded-lg border-hairline pl-10 text-[14px]", errors.username && "border-destructive/60")}
            {...register("username")}
          />
        </div>
        {errors.username && (
          <p id="username-error" className="text-[12px] font-semibold leading-[1.4] tracking-[0.05em] text-destructive">
            {errors.username.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-[14px] font-medium leading-[1.4] tracking-[0.02em]">Mật khẩu</Label>
          <Link
            href="#"
            className="text-[14px] font-medium leading-[1.4] tracking-[0.02em] text-primary hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </div>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={Boolean(errors.password) || undefined}
            aria-describedby={errors.password ? "password-error" : undefined}
            disabled={submitting}
            className={cn(
              "rounded-lg border-hairline pl-10 pr-12 text-[14px]",
              errors.password && "border-destructive/60",
            )}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            aria-pressed={showPassword}
            disabled={submitting}
            className={cn(
              "absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg",
              "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="text-[12px] font-semibold leading-[1.4] tracking-[0.05em] text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <label className="inline-flex cursor-pointer items-center gap-2 text-[14px] font-medium leading-[1.4] tracking-[0.02em] text-foreground">
          <Checkbox
            checked={Boolean(remember)}
            disabled={submitting}
            onCheckedChange={(state) =>
              setValue("remember", state === true, { shouldDirty: true })
            }
            aria-label="Ghi nhớ đăng nhập"
          />
          <span>Ghi nhớ đăng nhập</span>
        </label>
      </div>

      <Button
        type="submit"
        className="h-11 w-full rounded-lg bg-primary text-[14px] font-medium leading-[1.4] tracking-[0.02em]"
        disabled={submitting}
        aria-busy={submitting || undefined}
      >
        {submitting ? (
          <>
            <Spinner />
            <span>Đang đăng nhập…</span>
          </>
        ) : (
          <span>Đăng nhập</span>
        )}
      </Button>

      <p className="text-center text-[14px] font-normal leading-[1.6] text-muted-foreground">
        Bằng việc đăng nhập, bạn đồng ý với{" "}
        <Link href="#" className="text-foreground underline-offset-2 hover:underline">
          điều khoản sử dụng
        </Link>
        .
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------ *
 * Suspense fallback
 * ------------------------------------------------------------------ */

function LoginFormFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 py-12 text-[14px] font-normal leading-[1.6] text-muted-foreground"
    >
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span>Đang khởi tạo biểu mẫu…</span>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Spinner
 * ------------------------------------------------------------------ */

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4 animate-spin rounded-full border-hairline border-current border-r-transparent"
    />
  );
}

/* ------------------------------------------------------------------ *
 * Error normaliser
 * ------------------------------------------------------------------ */

function describeLoginError(error: APIError | Error | null): string {
  if (!error) return "";

  if (error instanceof APIError) {
    switch (error.code) {
      case "AUTH_INVALID_CREDENTIALS":
        return "Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại.";
      case "AUTH_ACCOUNT_DISABLED":
        return "Tài khoản của bạn đã bị vô hiệu hoá. Liên hệ quản trị viên.";
      case "AUTH_LOCKED":
        return "Tài khoản tạm thời bị khoá do đăng nhập sai nhiều lần. Vui lòng thử lại sau.";
      case "RATE_LIMITED":
        return "Bạn đã thử quá nhiều lần. Vui lòng đợi vài phút rồi thử lại.";
      case "VALIDATION_FAILED":
        return error.message || "Vui lòng kiểm tra lại thông tin đăng nhập.";
      case "INTERNAL":
      case "UNAVAILABLE":
        return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau ít phút.";
      default:
        if (error.isUnauthorized) {
          return "Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại.";
        }
        return error.message || "Đăng nhập thất bại. Vui lòng thử lại.";
    }
  }

  return error.message || "Đăng nhập thất bại. Vui lòng thử lại.";
}
