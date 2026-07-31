import * as React from "react";
import { SupportAgent } from "@/components/layout/storefront-icons";

/**
 * PoliciesConciergeFab — floating concierge FAB in the bottom-right
 * corner. Matches the Stitch HTML: bounce animation, hover tooltip
 * with `Concierge` / `Luxury Assistance` / `Chat Now`.
 */
export function PoliciesConciergeFab() {
  return (
    <div className="fixed bottom-8 right-8 z-[60] flex flex-col items-center">
      <button
        type="button"
        aria-label="Mở concierge Aura Rose"
        className="group relative flex items-center justify-center rounded-full bg-primary p-4 text-white shadow-2xl shadow-rose-200/50 transition-all duration-300 hover:scale-110 hover:rotate-3 animate-bounce-slow"
      >
        <SupportAgent size={24} />
        <div className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-4 flex flex-col items-end rounded-lg border border-rose-50 bg-white px-4 py-2 text-zinc-800 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 whitespace-nowrap">
          <span className="font-headline text-sm font-bold">Concierge</span>
          <span className="font-label text-xs text-zinc-500">Luxury Assistance</span>
          <span className="mt-1 text-xs font-medium text-primary">Chat Now</span>
        </div>
      </button>
    </div>
  );
}

PoliciesConciergeFab.displayName = "PoliciesConciergeFab";