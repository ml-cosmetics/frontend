"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowForward, Search } from "@/components/layout/storefront-icons";
import { cn } from "@/lib/utils/cn";

/**
 * SearchEmptyState — Stitch empty-state for the `/search` page.
 *
 * Canvas: `ML Cosmetics - Không tìm thấy kết quả`.
 *
 * Matches the Stitch HTML 1:1:
 *   1. Hero icon (gift box illustration on a soft pink halo)
 *   2. Italic Playfair headline
 *   3. Body text with the active query bolded
 *   4. Secondary search bar prefilled with the query
 *   5. "Gợi ý:" suggestion chips
 *   6. Bento grid:
 *      - Left column: 4 category tiles (Trang sức / Mỹ phẩm / Bộ quà
 *        tặng / Ưu đãi)
 *      - Right column: 3 mini product rows with badge + price
 *   7. Dual CTA: `Liên hệ tư vấn` (primary) + `Về trang chủ`
 *      (outline)
 */
export interface SearchEmptyCategoryTile {
  label: string;
  icon: string;
  href: string;
  /** Highlight the slot with the rose-50 accent background. */
  highlighted?: boolean;
}

export interface SearchEmptySuggestion {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  badge: { icon: string; label: string };
}

export interface SearchEmptyStateProps {
  query: string;
  categories?: SearchEmptyCategoryTile[];
  suggestions?: SearchEmptySuggestion[];
  onSearch?: (next: string) => void;
  onContactClick?: () => void;
  className?: string;
}

const DEFAULT_CATEGORIES: SearchEmptyCategoryTile[] = [
  { label: "Trang sức", icon: "diamond", href: "/products" },
  {
    label: "Mỹ phẩm",
    icon: "face_retouching_natural",
    href: "/products",
  },
  {
    label: "Bộ quà tặng",
    icon: "featured_seasonal_and_gifts",
    href: "/products",
  },
  {
    label: "Ưu đãi",
    icon: "local_offer",
    href: "/promotions",
    highlighted: true,
  },
];

const DEFAULT_SUGGESTIONS: SearchEmptySuggestion[] = [
  {
    id: "vong-tay-ngoc-xanh",
    name: "Vòng tay Ngọc Xanh Tinh Khôi",
    category: "Trang sức phong thủy",
    price: "1.250.000đ",
    image:
      "https://i.pinimg.com/736x/fa/55/4e/fa554e31ae3ac4e8e4481820d2eb768a.jpg",
    badge: { icon: "star", label: "Quà tặng kèm" },
  },
  {
    id: "set-duong-da-phuc-hoi",
    name: "Set Dưỡng Da Phục Hồi Aura",
    category: "Mỹ phẩm cao cấp",
    price: "890.000đ",
    image:
      "https://i.pinimg.com/736x/43/a1/eb/43a1eb9a8bbd5ab7661d58d7530094ea.jpg",
    badge: { icon: "local_fire_department", label: "Best seller" },
  },
  {
    id: "day-chuyen-phu-cu",
    name: "Dây chuyền Lấp Lánh Phù Cừ",
    category: "Bạc S925",
    price: "450.000đ",
    image:
      "https://i.pinimg.com/736x/07/8f/59/078f59b572bdeaf2de5c1d2f751c13f3.jpg",
    badge: { icon: "redeem", label: "Quà tặng kèm" },
  },
];

const SUGGESTION_CHIPS = [
  "Vòng tay",
  "Dây chuyền",
  "Dior Addict",
  "Set quà tặng",
  "Ngọc cẩm thạch",
] as const;

export function SearchEmptyState({
  query,
  categories = DEFAULT_CATEGORIES,
  suggestions = DEFAULT_SUGGESTIONS,
  onSearch,
  onContactClick,
  className,
}: SearchEmptyStateProps) {
  const [draft, setDraft] = React.useState(query);

  React.useEffect(() => {
    setDraft(query);
  }, [query]);

  return (
    <main
      className={cn(
        "mx-auto flex max-w-5xl flex-col items-center justify-center px-6 pb-24 pt-32 text-center md:pb-0",
        className,
      )}
    >
      {/* =========================== ILLUSTRATION =========================== */}
      <div className="group relative mb-8">
        <div className="absolute inset-0 scale-150 rounded-full bg-primary/5 blur-3xl transition-all duration-700 group-hover:bg-primary/10" />
        <Image
          alt="Hộp quà Aura Rose"
          width={192}
          height={192}
          className="relative z-10 mx-auto h-48 w-48 object-contain opacity-90 drop-shadow-sm"
          src="https://i.pinimg.com/1200x/86/09/e8/8609e800b9eef696a85a59d8aef83ce4.jpg"
        />
      </div>

      {/* =========================== HEADLINE =========================== */}
      <h1 className="mb-4 font-headline text-3xl italic text-primary md:text-4xl">
        Không tìm thấy sản phẩm phù hợp
      </h1>
      <p className="mb-8 max-w-lg leading-relaxed text-zinc-500">
        Chúng tôi không tìm thấy kết quả cho{" "}
        <span className="font-medium text-zinc-700">
          &ldquo;{query || "từ khóa của bạn"}&rdquo;
        </span>
        . Hãy thử từ khóa khác hoặc khám phá các danh mục bên dưới nhé.
      </p>

      {/* =========================== SECONDARY SEARCH =========================== */}
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch?.(draft.trim());
        }}
        className="relative mb-8 w-full max-w-md"
      >
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          aria-label="Tìm kiếm sản phẩm"
          className="w-full rounded-full border-rose-200 bg-white py-4 pl-12 pr-14 text-zinc-700 shadow-sm outline-none transition-all placeholder:text-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <Search
          size={18}
          className="absolute left-4 top-4 text-zinc-400"
        />
        <button
          type="submit"
          aria-label="Tìm kiếm"
          className="absolute right-2 top-2 rounded-full bg-rose-50 p-2 text-primary transition-colors hover:bg-rose-100"
        >
          <ArrowForward size={16} />
        </button>
      </form>

      {/* =========================== SUGGESTION CHIPS =========================== */}
      <div className="mb-16 flex flex-wrap justify-center gap-2">
        <span className="mr-2 py-2 text-sm text-zinc-400">Gợi ý:</span>
        {SUGGESTION_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => onSearch?.(chip)}
            className="rounded-full border border-rose-100 bg-white px-4 py-2 text-sm text-zinc-600 shadow-sm transition-colors hover:border-primary hover:text-primary"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* =========================== BENTO GRID =========================== */}
      <div className="grid w-full grid-cols-1 gap-8 text-left md:grid-cols-2">
        {/* Left column — categories */}
        <div className="space-y-4">
          <h3 className="mb-4 font-headline text-xl italic text-zinc-700">
            Danh mục nổi bật
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className={cn(
                  "group relative flex min-h-[120px] flex-col items-center justify-center overflow-hidden rounded-[20px] border bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md",
                  cat.highlighted
                    ? "border-rose-100 bg-rose-50/50"
                    : "border-rose-50",
                )}
              >
                <span
                  className={cn(
                    "material-symbols-outlined mb-2 text-3xl transition-all duration-300 group-hover:scale-110",
                    cat.highlighted
                      ? "text-primary"
                      : "text-rose-300 group-hover:text-primary",
                  )}
                >
                  {cat.icon}
                </span>
                <span
                  className={cn(
                    "font-medium transition-colors group-hover:text-primary",
                    cat.highlighted ? "text-primary" : "text-zinc-700",
                  )}
                >
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right column — suggestions */}
        <div className="space-y-4">
          <h3 className="mb-4 font-headline text-xl italic text-zinc-700">
            Có thể bạn quan tâm
          </h3>
          <div className="flex flex-col gap-4">
            {suggestions.map((item) => (
              <Link
                key={item.id}
                href="/products"
                className="group flex cursor-pointer items-center gap-4 rounded-[20px] border border-rose-50 bg-white p-3 shadow-sm transition-colors hover:border-rose-200"
              >
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-rose-50">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex-grow">
                  <h4 className="mb-1 line-clamp-1 text-sm font-medium text-zinc-800 transition-colors group-hover:text-primary">
                    {item.name}
                  </h4>
                  <p className="mb-2 text-xs text-zinc-500">{item.category}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary">
                      {item.price}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-primary">
                      <span
                        className="material-symbols-outlined text-[12px]"
                        style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
                      >
                        {item.badge.icon}
                      </span>
                      {item.badge.label}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* =========================== ACTION BUTTONS =========================== */}
      <div className="mt-12 mb-12 flex gap-4">
        <button
          type="button"
          onClick={onContactClick}
          className="rounded-2xl bg-primary px-8 py-3 font-medium text-white shadow-md shadow-rose-200 transition-all hover:-translate-y-0.5 hover:bg-rose-700"
        >
          Liên hệ tư vấn
        </button>
        <Link
          href="/"
          className="rounded-2xl border border-primary px-8 py-3 font-medium text-primary transition-all hover:-translate-y-0.5 hover:bg-rose-50"
        >
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}

SearchEmptyState.displayName = "SearchEmptyState";