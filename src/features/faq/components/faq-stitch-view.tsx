"use client";

import * as React from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AutoAwesome,
  Call,
  Chat,
  ExpandMore,
  Forum,
  Help,
  Mic,
  Search,
  SupportAgent,
} from "@/components/layout/storefront-icons";
import { cn } from "@/lib/utils/cn";
import type { FaqGroup } from "../types";

/**
 * FaqStitchView — Stitch layout for the `/faq` page.
 *
 * Canvas: `Hỏi đáp - ML Cosmetics`.
 *
 * Composition:
 *   1. Hero with `help` glyph + sparkle-text headline + search bar
 *      (with mic button) + decorative blobs.
 *   2. Horizontal category chips ("Tất cả" + each group).
 *   3. Two-column body:
 *      - Left: glass-card accordion (one-open) with `auto_awesome`
 *        glyph and Playfair headlines.
 *      - Right: sticky glass-card support widget with three CTAs
 *        (Messenger / Zalo / Hotline) + 5-star social proof.
 *   4. Quick links (4 cards in a row).
 *   5. Bottom CTA card with "Trò chuyện trực tiếp" button.
 */
export interface FaqStitchViewProps {
  groups: FaqGroup[];
  className?: string;
}

export function FaqStitchView({ groups, className }: FaqStitchViewProps) {
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");

  const allItems = React.useMemo(
    () => groups.flatMap((g) => g.items.map((item) => ({ ...item, category: g.category }))),
    [groups],
  );

  const filteredItems = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return allItems.filter((item) => {
      if (activeCategory !== "all" && item.category !== activeCategory) return false;
      if (!term) return true;
      return (
        item.question.toLowerCase().includes(term) ||
        item.answer.toLowerCase().includes(term)
      );
    });
  }, [allItems, activeCategory, search]);

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative z-10 pb-24 pt-[116px]", className)}>
      {/* =========================== HERO =========================== */}
      <section className="relative overflow-hidden px-6 pt-16 pb-20">
        <div className="absolute top-10 left-[10%] h-32 w-32 rounded-full bg-primary-200/40 blur-3xl animate-float" />
        <div
          className="absolute bottom-10 right-[15%] h-48 w-48 rounded-full bg-primary-300/30 blur-3xl animate-float"
          style={{ animationDelay: "1.5s" }}
        />
        <span
          className="material-symbols-outlined filled absolute top-20 right-[25%] animate-pulse text-4xl text-primary-300/50"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          favorite
        </span>
        <span
          className="material-symbols-outlined filled absolute bottom-32 left-[20%] animate-pulse text-3xl text-primary-200/60"
          style={{ animationDelay: "1s", fontVariationSettings: "'FILL' 1" }}
        >
          auto_awesome
        </span>
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="relative mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-primary-100 bg-surface-paper text-primary-600 shadow-sm">
            <Help size={28} />
            <AutoAwesome
              size={20}
              filled
              className="absolute -top-1 -right-1 animate-spin text-xl text-primary-400"
              style={{ animationDuration: "4s" }}
            />
          </div>
          <h1 className="font-headline mb-6 text-4xl font-bold italic tracking-tight text-neutral-900 md:text-5xl lg:text-6xl">
            Trung tâm hỗ trợ <span className="sparkle-text">ML Cosmetics</span>
          </h1>
          <p className="font-body mx-auto mb-10 max-w-2xl text-lg text-neutral-600">
            Tìm câu trả lời nhanh cho mọi thắc mắc. Hoặc trò chuyện trực tiếp
            qua Zalo với đội ngũ chăm sóc lãng mạn của chúng tôi.
          </p>
          <div className="group relative mx-auto max-w-2xl">
            <div className="absolute inset-0 rounded-full bg-primary-200 opacity-30 blur-md transition-opacity group-hover:opacity-50" />
            <div className="relative flex h-16 items-center rounded-full border border-primary-100 bg-white p-2 pr-4 shadow-lg transition-transform focus-within:scale-[1.02]">
              <div className="px-4 pr-3 text-primary-500">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm câu hỏi (VD: chính sách đổi trả, phí vận chuyển...)"
                aria-label="Tìm câu hỏi"
                className="font-body flex-1 border-none bg-transparent text-neutral-700 placeholder:text-neutral-400 focus:ring-0"
              />
              <button
                type="button"
                aria-label="Tìm bằng giọng nói"
                className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition-colors hover:bg-primary-100"
              >
                <Mic size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================== CATEGORY CHIPS =========================== */}
      <section className="mx-auto mb-12 max-w-6xl px-6">
        <div className="no-scrollbar flex justify-start space-x-3 overflow-x-auto pb-4 lg:justify-center">
          <CategoryChip
            label="Tất cả"
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
          />
          {groups.map((group) => (
            <CategoryChip
              key={group.category}
              label={group.category}
              active={activeCategory === group.category}
              onClick={() => setActiveCategory(group.category)}
            />
          ))}
        </div>
      </section>

      {/* =========================== MAIN BODY =========================== */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 lg:grid-cols-12">
        {/* LEFT — accordion */}
        <div className="space-y-4 lg:col-span-8">
          {filteredItems.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center text-sm text-muted-foreground shadow-sm">
              Không có câu hỏi nào khớp với từ khóa.
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {filteredItems.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="glass-card overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-md"
                >
                  <AccordionTrigger className="px-6 py-5 hover:no-underline">
                    <div className="flex items-center space-x-3 text-left">
                      <AutoAwesome
                        size={20}
                        filled
                        className="text-primary-400 transition-colors group-hover:text-primary-600"
                      />
                      <h3 className="font-headline text-lg font-bold italic text-neutral-800">
                        {item.question}
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pl-[52px]">
                    <p className="font-body leading-relaxed text-neutral-600">
                      {item.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        {/* RIGHT — sticky support card */}
        <div className="lg:col-span-4">
          <div className="glass-card sticky top-[120px] relative overflow-hidden rounded-xl border-t-4 border-t-primary-500 p-8 shadow-lg">
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-primary-100 opacity-60 blur-2xl" />
            <div className="relative z-10">
              <div className="mb-6 flex items-center space-x-2">
                <SupportAgent size={28} className="text-primary-500" />
                <h3 className="font-headline text-2xl font-bold italic text-neutral-800">
                  Vẫn cần hỗ trợ?
                </h3>
              </div>
              <p className="font-body mb-8 text-sm text-neutral-600">
                Đội ngũ Aura Rose luôn sẵn sàng lắng nghe và giải đáp mọi thắc
                mắc của bạn 24/7.
              </p>
              <div className="mb-8 space-y-4">
                <button
                  type="button"
                  className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-primary to-[#be185d] py-3 px-4 font-medium text-white shadow-md transition-transform hover:-translate-y-0.5 active:translate-y-0 hover:from-[#be185d] hover:to-primary"
                >
                  <Chat size={20} />
                  <span>Messenger</span>
                </button>
                <button
                  type="button"
                  className="flex w-full items-center justify-center space-x-2 rounded-xl bg-primary py-3 px-4 font-medium text-white shadow-md transition-transform hover:-translate-y-0.5 active:translate-y-0 hover:bg-[#be185d]"
                >
                  <Forum size={20} />
                  <span>Zalo Chat</span>
                </button>
                <button
                  type="button"
                  className="flex w-full items-center justify-center space-x-2 rounded-xl border-2 border-primary bg-white py-3 px-4 font-medium text-primary shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0 hover:bg-rose-50"
                >
                  <Call size={20} />
                  <span>Hotline: 1900 6868</span>
                </button>
              </div>
              <div className="border-t border-rose-100 pt-6 text-center">
                <div className="mb-2 flex justify-center space-x-1 text-yellow-400">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-sm"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="text-xs font-medium text-neutral-500">
                  98% hài lòng • Phản hồi 4 phút
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  Dựa trên 1.247 đánh giá
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================== QUICK LINKS =========================== */}
      <section className="mx-auto mt-20 max-w-6xl px-6">
        <h2 className="font-headline mb-8 text-center text-2xl font-bold italic text-neutral-800">
          Liên kết hữu ích
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="group flex items-center justify-between rounded-xl border border-rose-50 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <span className="font-medium text-neutral-700 transition-colors group-hover:text-primary-600">
                {link.label}
              </span>
              <span className="material-symbols-outlined text-primary-200 transition-colors group-hover:translate-x-1 group-hover:text-primary-500">
                arrow_forward
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================== CTA CARD =========================== */}
      <section className="mx-auto mb-10 mt-24 max-w-4xl px-6 text-center">
        <div className="relative overflow-hidden rounded-2xl border border-primary bg-gradient-to-br from-rose-50 to-white p-10 shadow-sm">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-rose-100/60" />
          <div className="absolute bottom-0 left-0 h-24 w-24 rounded-tr-full bg-rose-100/60" />
          <h2 className="font-headline relative z-10 mb-4 text-3xl font-bold italic text-neutral-800">
            Bạn vẫn chưa tìm thấy câu trả lời?
          </h2>
          <p className="relative z-10 mx-auto mb-8 max-w-lg text-neutral-600">
            Đừng ngần ngại liên hệ trực tiếp với chuyên gia tư vấn của chúng
            tôi. Chúng tôi luôn mong muốn mang đến trải nghiệm mua sắm tuyệt
            vời nhất.
          </p>
          <button
            type="button"
            className="relative z-10 mx-auto flex items-center space-x-2 rounded-xl bg-primary px-8 py-4 font-medium text-white shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5 hover:bg-[#be185d] active:translate-y-0"
          >
            <span className="material-symbols-outlined text-xl">
              mark_chat_unread
            </span>
            <span>Trò chuyện trực tiếp</span>
          </button>
        </div>
      </section>
    </div>
  );
}

FaqStitchView.displayName = "FaqStitchView";

const QUICK_LINKS = [
  { label: "Chính sách bảo mật", href: "/terms#bao-mat" },
  { label: "Hướng dẫn đo size", href: "/products" },
  { label: "Hệ thống cửa hàng", href: "/about" },
  { label: "Đăng ký VIP", href: "/contact" },
] as const;

interface CategoryChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function CategoryChip({ label, active, onClick }: CategoryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "whitespace-nowrap rounded-full border px-6 py-2.5 font-medium shadow-sm transition-all active:scale-95",
        active
          ? "border-primary bg-gradient-to-r from-primary to-[#be185d] text-white shadow-md shadow-primary/30"
          : "border-rose-100 bg-white text-zinc-600 hover:border-primary hover:text-primary",
      )}
    >
      {label}
    </button>
  );
}

CategoryChip.displayName = "CategoryChip";

// Re-export so callers can find the stitch view next to the classic one.
export { ExpandMore };