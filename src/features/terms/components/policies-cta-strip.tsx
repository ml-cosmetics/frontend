import * as React from "react";
import { Call, ChatBubble, Flare, Forum } from "@/components/layout/storefront-icons";

/**
 * PoliciesCTAStrip — gradient CTA strip with Messenger, Zalo, and
 * Hotline (24/7) buttons. Matches the Stitch `Chính sách &
 * Điều khoản` HTML exactly.
 */
export function PoliciesCTAStrip() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-rose-100/50 via-white to-rose-100/50 py-16">
      <Flare
        size={20}
        filled
        className="animate-spin-slow absolute right-1/3 top-4 text-xl text-rose-300 opacity-60"
      />
      <Flare
        size={20}
        filled
        className="animate-pulse absolute bottom-4 left-1/3 text-2xl text-rose-300 opacity-60"
      />
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <h2 className="font-playfair mb-8 text-3xl italic text-zinc-900">
          Có thắc mắc về chính sách?
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            type="button"
            className="flex items-center space-x-2 rounded-[16px] border border-rose-100 bg-white px-6 py-3 font-body font-medium text-zinc-700 shadow-sm transition-all hover:scale-105 hover:bg-rose-50"
          >
            <Forum size={18} className="text-blue-500" />
            <span>Messenger</span>
          </button>
          <button
            type="button"
            className="flex items-center space-x-2 rounded-[16px] border border-rose-100 bg-white px-6 py-3 font-body font-medium text-zinc-700 shadow-sm transition-all hover:scale-105 hover:bg-rose-50"
          >
            <ChatBubble size={18} className="text-blue-400" />
            <span>Zalo</span>
          </button>
          <button
            type="button"
            className="flex items-center space-x-2 rounded-[16px] bg-primary px-6 py-3 font-body font-medium text-white shadow-sm transition-all hover:scale-105 hover:bg-rose-600"
          >
            <Call size={18} />
            <span>Hotline (24/7)</span>
          </button>
        </div>
      </div>
    </section>
  );
}

PoliciesCTAStrip.displayName = "PoliciesCTAStrip";