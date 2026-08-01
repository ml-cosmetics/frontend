"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Copy } from "lucide-react";
import { cn, formatVND, resolveImageUrl } from "@/lib/utils";
import { CheckCircle, Favorite } from "@/components/layout/storefront-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/features/wishlist";
import { toast } from "sonner";
import type { ProductListItem } from "@/types";

/**
 * Product card for the public storefront catalogue.
 *
 * Layout (top → bottom):
 *   1. Hero image (1:1 by default). Click on image or product name
 *      navigates to `/products/[slug]`.
 *   2. Action row — LEFT: tag pills (sale / new / best / gift).
 *      RIGHT: heart (add-to-wishlist) + copy link button, both
 *      rendered as plain icons (no outline ring) so they stay
 *      visually quiet until the user hovers. The heart fills with
 *      `text-primary` once the product is in the wishlist. The copy
 *      button swaps to a success icon for 2 s after a successful
 *      clipboard write, then returns to the default state.
 *   3. Product title — `font-headline` 18 px / 600 / line-clamp 2.
 *      Click on title also navigates to the product details.
 *   4. Price — 18 px / 700 / primary.
 *
 * Single source for the entire storefront:
 *   - Homepage sections
 *   - Products listing
 *   - Search results
 *   - Wishlist recommendations
 *   - Promotions grid
 *   - Related products
 *
 * Reused primitives (no JSX / class duplication):
 *   - `Badge` (`@/components/ui/badge`) for tag pills
 *   - `Button` (`@/components/ui/button`) for the ghost Copy action
 *   - `Favorite` + `CheckCircle` (`@/components/layout/storefront-icons`)
 *     and lucide's `Copy` for the action icons
 *   - `cn`, `formatVND`, `resolveImageUrl` (`@/lib/utils`)
 */
export interface ProductCardTag {
  label: string;
  tone: "sale" | "new" | "best" | "gift";
}

export interface ProductCardProps {
  product: ProductListItem;
  className?: string;
  /** Render the auto-derived discount tag (`-15%`). Defaults to true.
   *  Deprecated alias: `showBadge`. */
  showDiscountTag?: boolean;
  /** @deprecated Use `showDiscountTag`. */
  showBadge?: boolean;
  /** Render a floating favorite button overlay. Defaults to true. */
  showFavorite?: boolean;
  /** Override the auto-derived tag pill (e.g. "Bán chạy" / "Mới về").
   *  Wins over `showDiscountTag` when provided. */
  tags?: ProductCardTag[];
  /** Deprecated alias for a single-pill `tags`. Use `tags` for
   *  multi-pill collections. */
  cornerBadge?: ProductCardTag;
  /** Deprecated — the public card no longer renders sold counts. */
  soldCount?: number;
  /** Image aspect ratio. Defaults to 1:1 per the Stitch spec. */
  aspect?: "square" | "portrait";
  priority?: boolean;
  /** Override the underlying `<a>` href. Defaults to `/products/[slug]`. */
  href?: string;
  /** Tailwind class added to the image wrapper (for grouping transitions). */
  imageWrapperClassName?: string;
  /** Render a ghost "Copy" button on the right of the tag row. */
  showCopy?: boolean;
  /** When true, the favorite (heart) button is rendered with a
   *  primary-color ring so it reads as the active control on the
   *  card — useful on the wishlist page where every product is
   *  already saved and the heart doubles as the "remove" affordance. */
  favoriteAccent?: boolean;
}

const TAG_CLASS: Record<ProductCardTag["tone"], string> = {
  sale: "bg-primary text-primary-foreground",
  new: "bg-primary text-primary-foreground",
  best: "bg-zinc-900 text-white",
  gift: "bg-gradient-to-r from-primary to-rose-400 text-white",
};

export function ProductCard({
  product,
  className,
  showDiscountTag,
  showBadge,
  showFavorite = true,
  tags,
  cornerBadge,
  aspect = "square",
  priority,
  href,
  imageWrapperClassName,
  showCopy = true,
  favoriteAccent = false,
}: ProductCardProps) {
  const discountEnabled = showDiscountTag ?? showBadge ?? true;

  const hasDiscount =
    typeof product.compare_at === "number" &&
    product.compare_at !== null &&
    product.compare_at > product.price;

  const derivedTag: ProductCardTag | null =
    hasDiscount && discountEnabled
      ? {
          label: `-${Math.round((1 - product.price / (product.compare_at as number)) * 100)}%`,
          tone: "sale",
        }
      : null;

  const activeTags: ProductCardTag[] =
    tags ??
    (cornerBadge ? [cornerBadge] : null) ??
    (derivedTag ? [derivedTag] : []);

  const linkHref = href ?? `/products/${product.slug || product.id}`;

  const wishlist = useWishlist();
  const [wishlisted, setWishlisted] = React.useState(false);

  React.useEffect(() => {
    if (!wishlist.isHydrated) return;
    setWishlisted(wishlist.has(product.id));
  }, [wishlist, product.id]);

  const [copied, setCopied] = React.useState(false);

  const copyStateTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  React.useEffect(() => {
    return () => {
      if (copyStateTimeoutRef.current) {
        clearTimeout(copyStateTimeoutRef.current);
      }
    };
  }, []);

  const handleToggleWishlist = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const added = wishlist.toggle({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      compareAt: product.compare_at ?? null,
      thumbnailUrl: product.thumbnail_url ?? "",
    });
    const next = wishlist.has(product.id);
    setWishlisted(next);
    toast.success(
      added
        ? `Đã thêm "${product.name}" vào wishlist.`
        : `Đã bỏ "${product.name}" khỏi wishlist.`,
    );
  };

  const handleCopy = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof navigator === "undefined" || !("clipboard" in navigator)) {
      return;
    }
    const absoluteUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${linkHref}`
        : linkHref;
    navigator.clipboard
      .writeText(absoluteUrl)
      .then(() => {
        setCopied(true);
        if (copyStateTimeoutRef.current) {
          clearTimeout(copyStateTimeoutRef.current);
        }
        copyStateTimeoutRef.current = setTimeout(() => {
          setCopied(false);
          copyStateTimeoutRef.current = null;
        }, 2000);
      })
      .catch(() => undefined);
  };

  return (
<Link
        href={linkHref}
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-2xl border border-rose-50 bg-gradient-to-br from-[#FFF1F7] via-white to-[#FCE7F3] text-card-foreground",
          "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(225,29,116,0.10),0_8px_10px_-6px_rgba(225,29,116,0.10)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className,
        )}
        aria-label={product.name}
      >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-zinc-100",
          aspect === "square" ? "aspect-square" : "aspect-[4/5]",
          imageWrapperClassName,
        )}
      >
        {product.thumbnail_url ? (
          <Image
            src={resolveImageUrl(product.thumbnail_url)}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            priority={priority}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden
            className="grid h-full w-full place-items-center text-[14px] text-zinc-400"
          >
            Không có hình
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {activeTags.map((tag) => (
              <Badge
                key={tag.label}
                className={cn(
                  "rounded-full px-3 py-1 text-[12px] font-bold shadow-sm border-transparent",
                  TAG_CLASS[tag.tone],
                )}
              >
                {tag.label}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-0.5">
            {showFavorite && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={wishlisted ? "Bỏ yêu thích" : "Yêu thích"}
                aria-pressed={wishlisted}
                onClick={handleToggleWishlist}
                className={cn(
                  "h-8 w-8 rounded-full transition-all",
                  favoriteAccent
                    ? wishlisted
                      ? "bg-primary text-primary-foreground ring-2 ring-primary hover:bg-primary/90 hover:text-primary-foreground"
                      : "text-zinc-400 ring-2 ring-primary/30 hover:bg-rose-50 hover:text-primary"
                    : "hover:bg-rose-50",
                  !favoriteAccent &&
                    (wishlisted
                      ? "text-primary"
                      : "text-zinc-400 hover:text-primary"),
                )}
              >
                <Favorite size={16} filled={wishlisted} />
              </Button>
            )}
            {showCopy && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                aria-label={
                  copied ? "Đã sao chép đường dẫn sản phẩm" : "Sao chép đường dẫn sản phẩm"
                }
                className={cn(
                  "h-8 w-8 rounded-full hover:bg-rose-50",
                  copied ? "text-primary" : "text-zinc-400 hover:text-primary",
                )}
              >
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              </Button>
            )}
          </div>
        </div>

        <h3 className="line-clamp-2 font-headline text-[18px] font-semibold leading-snug text-zinc-800 transition-colors group-hover:text-primary">
          {product.name}
        </h3>

        <div className="mt-1 flex items-center justify-between">
          <span className="text-[18px] font-bold text-primary">
            {formatVND(product.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}

ProductCard.displayName = "ProductCard";
