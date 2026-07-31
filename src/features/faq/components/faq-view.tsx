"use client";

import * as React from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils/cn";
import type { FaqGroup } from "../types";

/**
 * Accordion + sidebar list — the canonical FAQ layout.
 *
 * Composition (matches Stitch spec `8e99ac951aed475faf3d91fb0f3988e2`):
 *   - Left column: scrollable category sidebar with badges.
 *   - Right column: hero card with the active category title +
 *     description + a single-open accordion of the questions.
 *
 * State stays local — the active category drives which group the
 * accordion renders. The sidebar CTA navigates to `/contact`.
 */
export interface FaqViewProps {
  groups: FaqGroup[];
  activeCategory?: string;
  onActiveCategoryChange?: (category: string) => void;
  className?: string;
}

export function FaqView({
  groups,
  activeCategory,
  onActiveCategoryChange,
  className,
}: FaqViewProps) {
  const firstCategory = groups[0]?.category ?? "";
  const current = groups.find((group) => group.category === activeCategory) ?? groups[0];

  React.useEffect(() => {
    if (!activeCategory && firstCategory) {
      onActiveCategoryChange?.(firstCategory);
    }
  }, [activeCategory, firstCategory, onActiveCategoryChange]);

  if (groups.length === 0 || !current) {
    return null;
  }

  const totalQuestions = groups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div
      className={cn(
        "grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-12",
        className,
      )}
    >
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="space-y-5 rounded-xl border border-hairline bg-card p-5 shadow-sm">
          <div className="space-y-1">
            <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-primary">
              Danh mục
            </p>
            <p className="text-[14px] text-muted-foreground">
              {totalQuestions} câu hỏi thường gặp
            </p>
          </div>
          <ul className="space-y-1" aria-label="Danh mục câu hỏi">
            {groups.map((group) => {
              const isActive = group.category === current.category;
              return (
                <li key={group.category}>
                  <button
                    type="button"
                    onClick={() => onActiveCategoryChange?.(group.category)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-accent",
                    )}
                  >
                    <span className="line-clamp-1">{group.category}</span>
                    <span
                      className={cn(
                        "grid h-6 min-w-[24px] place-items-center rounded-full px-1.5 text-[11px] font-semibold",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {group.items.length}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-primary">
            Vẫn cần hỗ trợ?
          </p>
          <p className="mt-2 text-[14px] leading-[1.6] text-foreground">
            Đội ngũ Aura Vénus sẵn sàng tư vấn riêng cho bạn.
          </p>
          <Link
            href="/contact"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[14px] font-medium text-primary-foreground transition-colors hover:bg-[#be185d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Liên hệ tư vấn
          </Link>
        </div>
      </aside>

      <section
        aria-label={current.category}
        className="rounded-xl border border-hairline bg-card p-6 md:p-10 shadow-sm"
      >
        <div className="space-y-2">
          <h2 className="text-[24px] font-semibold leading-[1.3] text-foreground md:text-[28px]">
            {current.category}
          </h2>
          {current.description && (
            <p className="max-w-2xl text-[14px] leading-[1.6] text-muted-foreground">
              {current.description}
            </p>
          )}
        </div>

        <Accordion type="single" collapsible className="mt-6 w-full">
          {current.items.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="text-left text-[15px] font-medium text-foreground hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent>
                <p className="whitespace-pre-line text-[14px] leading-[1.7] text-muted-foreground">
                  {item.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}

FaqView.displayName = "FaqView";