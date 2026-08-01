import * as React from "react";
import Link from "next/link";
import { Chat, ContactSupport, PhotoCamera } from "./storefront-icons";
import { cn } from "@/lib/utils/cn";

/**
 * FloatingActionBubble — Stitch storefront floating side-nav.
 *
 * Three circular shortcut buttons anchored at the bottom-right of
 * every public route. Mirrors the Stitch HTML byte-for-byte:
 *   - `fixed bottom-8 right-8 flex flex-col gap-3 z-50`
 *   - `rounded-full p-2 bg-white shadow-2xl shadow-rose-200/50`
 *   - First button (chat) is solid pink with white glyph; the other
 *     two are white with a `border-rose-100` ring and pink glyph.
 *   - `pulse-soft` keyframe animation on the wrapper so it draws
 *     attention without being intrusive.
 */

export interface FloatingActionBubbleProps {
  chatHref?: string;
  supportHref?: string;
  cameraHref?: string;
  className?: string;
}

export function FloatingActionBubble({
  chatHref = "/contact",
  supportHref = "/faq",
  cameraHref = "/promotions",
  className,
}: FloatingActionBubbleProps) {
  return (
    <div
      className={cn(
        "fixed bottom-8 right-8 z-50 flex flex-col items-center gap-3 rounded-full bg-white p-2 shadow-2xl shadow-rose-200/50 pulse-soft",
        className,
      )}
      role="navigation"
      aria-label="Liên hệ nhanh"
    >
      <BubbleLink
        href={chatHref}
        label="Chat Zalo"
        variant="primary"
        icon={<Chat />}
      />
      <BubbleLink
        href={supportHref}
        label="Tư vấn"
        variant="outline"
        icon={<ContactSupport />}
      />
      <BubbleLink
        href={cameraHref}
        label="Cửa hàng"
        variant="outline"
        icon={<PhotoCamera />}
      />
    </div>
  );
}

function BubbleLink({
  href,
  label,
  variant,
  icon,
}: {
  href: string;
  label: string;
  variant: "primary" | "outline";
  icon: React.ReactNode;
}) {
  const base =
    "flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:scale-110 hover:rotate-3";
  const styles =
    variant === "primary"
      ? "bg-[#E11D74] text-white"
      : "border border-rose-100 bg-white text-[#E11D74]";
  return (
    <Link href={href} aria-label={label} className={cn(base, styles)}>
      {icon}
    </Link>
  );
}

FloatingActionBubble.displayName = "FloatingActionBubble";