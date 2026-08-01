import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Category chips — light pastel pill + leading dot.
 *
 * Used by both the React Table version (`columns.tsx`) and the
 * Monolith hardcoded table (`product-list-view.tsx`) of the admin
 * product list. Extracted so both views stay in sync.
 *
 * The palette stays inside a narrow band of Aura Vénus-friendly
 * pastels (rose, amber, emerald, sky, violet, teal, slate) so no
 * chip ever reads as "loud" against the cream admin skin.
 */

/** Pastel pink pair used for the "Chưa phân loại" placeholder. */
const UNCATEGORIZED = {
  bg: "bg-[#fdf2f8]", // pink-50
  text: "text-[#9d174d]", // pink-800
  dot: "bg-[#f9a8d4]", // pink-300
} as const;

const CATEGORY_PALETTE = [
  { bg: "bg-[#fce7f3]", text: "text-[#9d174d]", dot: "bg-[#ec4899]" }, // rose
  { bg: "bg-[#fef3c7]", text: "text-[#92400e]", dot: "bg-[#f59e0b]" }, // amber
  { bg: "bg-[#d1fae5]", text: "text-[#065f46]", dot: "bg-[#10b981]" }, // emerald
  { bg: "bg-[#e0f2fe]", text: "text-[#075985]", dot: "bg-[#0ea5e9]" }, // sky
  { bg: "bg-[#ede9fe]", text: "text-[#5b21b6]", dot: "bg-[#8b5cf6]" }, // violet
  { bg: "bg-[#ccfbf1]", text: "text-[#115e59]", dot: "bg-[#14b8a6]" }, // teal
  { bg: "bg-[#e2e8f0]", text: "text-[#334155]", dot: "bg-[#64748b]" }, // slate
] as const;

function hashCategory(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return h;
}

const chipBase =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 " +
  "text-[12px] font-medium leading-[1.4] tracking-[0.01em] " +
  "border border-transparent";

export function CategoryChip({ name }: { name: string }) {
  const idx =
    CATEGORY_PALETTE.length > 0
      ? hashCategory(name) % CATEGORY_PALETTE.length
      : 0;
  const tone = CATEGORY_PALETTE[idx] ?? CATEGORY_PALETTE[0];
  return (
    <span className={cn(chipBase, tone.bg, tone.text)}>
      <span
        aria-hidden="true"
        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", tone.dot)}
      />
      {name}
    </span>
  );
}

export function UncategorizedChip() {
  return (
    <span
      className={cn(
        chipBase,
        UNCATEGORIZED.bg,
        UNCATEGORIZED.text,
        "italic font-normal",
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", UNCATEGORIZED.dot)}
      />
      Chưa phân loại
    </span>
  );
}

/**
 * Render either a real category chip or the "Chưa phân loại"
 * placeholder based on whether the input is non-empty.
 */
export function ProductCategoryChip({ name }: { name: string | null | undefined }) {
  const trimmed = name?.trim();
  if (!trimmed) return <UncategorizedChip />;
  return <CategoryChip name={trimmed} />;
}
