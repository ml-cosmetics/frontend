"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * BackToTop — floating circular button that appears once the user has
 * scrolled past `threshold` and snaps the page back to the top on
 * click. Mounted once at the root layout so every route in the app —
 * storefront, admin, operator — gets the affordance for free.
 *
 * Auto-styling:
 *   - The component introspects the DOM for known shell markers
 *     (`.aura-admin-bg`, `.aura-oper-bg`) to decide if the active
 *     page sits inside the **Monolith** (admin / operator) chrome
 *     or the **Aura Vénus** (public storefront) chrome, and switches
 *     its palette to match.
 *   - Listens to `window` scroll via `passive` listener +
 *     `requestAnimationFrame` to throttle updates; resets cleanly on
 *     unmount.
 *   - Honours `prefers-reduced-motion`: instant scroll instead of
 *     smooth.
 *   - Hidden when `scrollY < threshold` (default 400 px). Visibility
 *     animates via opacity + translate-Y + scale so the chip glides
 *     instead of popping.
 *   - Renders `sr-only` "Lên đầu trang" label for assistive tech.
 */
export interface BackToTopProps {
  /** Scroll distance (px) before the button shows. */
  threshold?: number;
  /** Distance from the bottom-right corner. */
  offset?: number;
  className?: string;
}

const MONOLITH_MARKERS = ["aura-admin-bg", "aura-oper-bg"];

const roseStyles = cn(
  "bg-white/85 text-primary border border-rose-100/80",
  "shadow-[0_8px_24px_-8px_rgba(225,29,116,0.45),0_2px_6px_-2px_rgba(0,0,0,0.06)]",
  "hover:bg-gradient-to-br hover:from-[#FFF1F7] hover:to-[#FCE7F3]",
  "hover:border-primary/50 hover:shadow-[0_12px_28px_-8px_rgba(225,29,116,0.55)]",
  "backdrop-blur",
);

const monolithStyles = cn(
  "bg-zinc-900/95 text-white border border-zinc-700",
  "shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)]",
  "hover:bg-zinc-900 hover:border-zinc-500",
);

function detectMonolithChrome(): boolean {
  if (typeof document === "undefined") return false;
  for (const marker of MONOLITH_MARKERS) {
    if (document.querySelector(`.${marker}`)) return true;
  }
  return false;
}

export function BackToTop({
  threshold = 400,
  offset = 24,
  className,
}: BackToTopProps) {
  const [visible, setVisible] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [monolith, setMonolith] = React.useState(false);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    setMounted(true);

    const syncChrome = () => setMonolith(detectMonolithChrome());
    syncChrome();

    // Rescanning on next tick catches shells that mount a frame later
    // (admin + operator both render server-rendered shell markup that
    // hydrates after the button does).
    const rafId = window.requestAnimationFrame(syncChrome);
    const timeoutId = window.setTimeout(syncChrome, 250);

    const observer = new MutationObserver(syncChrome);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        setVisible(window.scrollY >= threshold);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [threshold]);

  const handleClick = React.useCallback(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, []);

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Lên đầu trang"
      title="Lên đầu trang"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        "group fixed z-50 grid place-items-center rounded-full",
        "h-11 w-11 transition-all duration-300 ease-out",
        // Visibility animation.
        visible
          ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-3 scale-90 opacity-0",
        // Hover lift.
        "hover:-translate-y-0.5 active:translate-y-0 active:scale-95",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        monolith ? monolithStyles : roseStyles,
        className,
      )}
      style={{
        right: `max(${offset}px, env(safe-area-inset-right, 0px))`,
        bottom: `max(${offset}px, env(safe-area-inset-bottom, 0px))`,
      }}
    >
      <ArrowUp
        className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5"
        aria-hidden="true"
      />
      <span className="sr-only">Lên đầu trang</span>
    </button>
  );
}

BackToTop.displayName = "BackToTop";
