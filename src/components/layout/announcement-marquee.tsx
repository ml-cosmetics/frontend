import * as React from "react";
import { Stars } from "@/components/layout/storefront-icons";
import { cn } from "@/lib/utils/cn";

/**
 * AnnouncementMarquee — Stitch storefront announcement strip.
 *
 * Renders directly under the sticky `TopNav` (offset by the nav's
 * height via the `mt-20` Tailwind class). The marquee runs an
 * infinite horizontal loop using the `@keyframes marquee` defined in
 * `globals.css`.
 *
 * Each chip is prefixed with a `stars` Material Symbols glyph to
 * match the Stitch promotion canvas. The gradient matches Stitch
 * exactly: `from-[#E11D74] to-[#FF8A8A]`.
 *
 * Default messages mirror the Stitch promotions screen. Callers can
 * override via `message` (single string) or `messages` (array).
 */
export interface AnnouncementMarqueeProps {
  message?: string;
  messages?: string[];
  /** Tailwind classes appended to the root element. */
  className?: string;
}

const DEFAULT_MESSAGES = [
  "FREESHIP TOÀN QUỐC CHO ĐƠN TỪ 500K",
  "TẶNG KÈM HỘP NHUNG CAO CẤP",
  "KIỂM ĐỊNH GRA CHÍNH HÃNG",
];

export function AnnouncementMarquee({
  message,
  messages,
  className,
}: AnnouncementMarqueeProps) {
  const list = React.useMemo(() => {
    if (message) return [message];
    if (messages && messages.length > 0) return messages;
    return DEFAULT_MESSAGES;
  }, [message, messages]);

  // Stitch repeats the cycle twice so the marquee content is always
  // wider than the viewport.
  const cycle = list.concat(list);

  return (
    <div
      className={cn(
        "relative mt-20 overflow-hidden bg-gradient-to-r from-[#E11D74] to-[#FF8A8A] py-2 text-sm text-white",
        className,
      )}
      role="marquee"
      aria-label="Thông báo khuyến mãi"
    >
      <div className="animate-marquee flex items-center gap-4 font-medium tracking-wide">
        {cycle.map((text, idx) => (
          <span key={idx} className="flex items-center gap-2 whitespace-nowrap">
            <Stars size={14} className="text-sm" />
            <span>{text}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

AnnouncementMarquee.displayName = "AnnouncementMarquee";