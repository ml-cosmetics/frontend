"use client";

import * as React from "react";
import { Star, BadgeCheck, Quote, Camera, Send } from "lucide-react";
import { cn, formatRelative } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { ReviewItem, ReviewStats, ReviewChannel } from "../types";
import { avatarInitial, toneFromId } from "../types";

/**
 * Public Reviews view — the canonical Stitch layout
 * (`20089184785244d0b1e1cce1bf0f64b2`).
 *
 * Composition:
 *   1. Editorial hero with eyebrow, headline, average rating card
 *      (stars + breakdown bars), and an interactive "write a review"
 *      card with a star picker + form.
 *   2. Filter chip row — "All / By rating / By channel" with counts.
 *   3. Masonry of testimonial cards (3 columns desktop, 2 tablet, 1
 *      mobile) with avatar, rating, title, body, author chip, date.
 *   4. Pagination (the storefront cap is 12 testimonials/page).
 */
export interface ReviewsViewProps {
  stats: ReviewStats;
  items: ReviewItem[];
  className?: string;
}

type RatingFilter = "all" | 1 | 2 | 3 | 4 | 5;
type ChannelFilter = "all" | ReviewChannel;
type VerifiedFilter = "all" | "verified" | "guests";

const CHANNEL_OPTIONS: ReviewChannel[] = ["Website", "Showroom", "Facebook", "Zalo", "Instagram"];

const TONE_CLASSES = [
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-teal-100 text-teal-700",
];

const PAGE_SIZE = 12;

export function ReviewsView({ stats, items, className }: ReviewsViewProps) {
  const [ratingFilter, setRatingFilter] = React.useState<RatingFilter>("all");
  const [channelFilter, setChannelFilter] = React.useState<ChannelFilter>("all");
  const [verifiedFilter, setVerifiedFilter] = React.useState<VerifiedFilter>("all");
  const [page, setPage] = React.useState(1);

  // Reset to page 1 whenever any filter changes.
  React.useEffect(() => {
    setPage(1);
  }, [ratingFilter, channelFilter, verifiedFilter]);

  const filtered = React.useMemo(() => {
    return items.filter((item) => {
      if (ratingFilter !== "all" && item.rating !== ratingFilter) return false;
      if (channelFilter !== "all" && item.channel !== channelFilter) return false;
      if (verifiedFilter === "verified" && !item.verified) return false;
      if (verifiedFilter === "guests" && item.verified) return false;
      return true;
    });
  }, [items, ratingFilter, channelFilter, verifiedFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className={cn("space-y-12", className)}>
      {/* =========================== HERO =========================== */}
      <ReviewHero stats={stats} />

      {/* =========================== FILTER ROW =========================== */}
      <FilterRow
        total={filtered.length}
        totalAll={items.length}
        ratingFilter={ratingFilter}
        onRatingChange={setRatingFilter}
        channelFilter={channelFilter}
        onChannelChange={setChannelFilter}
        verifiedFilter={verifiedFilter}
        onVerifiedChange={setVerifiedFilter}
      />

      {/* =========================== GRID =========================== */}
      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-hairline bg-card px-6 py-16 text-center">
          <p className="text-[18px] font-semibold text-foreground">
            Không tìm thấy đánh giá phù hợp
          </p>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Hãy thử thay đổi bộ lọc hoặc quay lại sau khi có thêm đánh giá mới.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setRatingFilter("all");
              setChannelFilter("all");
              setVerifiedFilter("all");
            }}
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      ) : (
        <div className="columns-1 gap-6 md:columns-2 lg:columns-3 [&>*]:mb-6 [&>*]:break-inside-avoid">
          {visible.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* =========================== PAGINATION =========================== */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Trang trước
          </Button>
          <span className="px-3 text-[14px] text-muted-foreground">
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  );
}

ReviewsView.displayName = "ReviewsView";

/* ========================================================================== *
 * Hero                                                                       *
 * ========================================================================== */

function ReviewHero({ stats }: { stats: ReviewStats }) {
  const max = Math.max(...Object.values(stats.distribution), 1);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="rounded-xl border border-hairline bg-card p-6 shadow-sm md:p-10">
        <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-primary">
          Đánh giá từ khách hàng
        </p>
        <h2 className="mt-3 text-[28px] font-semibold leading-[1.2] text-foreground md:text-[32px]">
          {stats.average.toFixed(1)} / 5.0
        </h2>
        <StarsRow value={stats.average} size="lg" />
        <p className="mt-3 text-[14px] text-muted-foreground">
          Dựa trên <span className="font-semibold text-foreground">{stats.total.toLocaleString("vi-VN")}</span> đánh giá thực từ khách hàng đã mua sắm tại Aura Vénus.
        </p>

        <div className="mt-6 space-y-2">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = stats.distribution[star] ?? 0;
            const percent = (count / max) * 100;
            return (
              <div key={star} className="flex items-center gap-3 text-[13px]">
                <span className="w-10 shrink-0 text-muted-foreground">{star} ★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right font-medium text-foreground">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <WriteReviewCard />
    </div>
  );
}

/* ========================================================================== *
 * Write review card (interactive form, local state only)                     *
 * ========================================================================== */

function WriteReviewCard() {
  const [rating, setRating] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (rating === 0) return;
      setSubmitting(true);
      window.setTimeout(() => {
        setSubmitting(false);
        setSubmitted(true);
        setRating(0);
      }, 600);
    },
    [rating],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-hairline bg-card p-6 shadow-sm md:p-8"
    >
      <div className="space-y-2">
        <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-primary">
          Chia sẻ trải nghiệm
        </p>
        <h3 className="text-[20px] font-semibold leading-[1.3] text-foreground">
          Viết đánh giá cho Aura Vénus
        </h3>
        <p className="text-[14px] text-muted-foreground">
          Cảm ơn bạn đã dành thời gian — mỗi đánh giá giúp ML Cosmetics và đội ngũ phục vụ tốt hơn.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reviews-name">Tên hiển thị</Label>
        <Input id="reviews-name" name="name" placeholder="Nguyễn Văn A" required />
      </div>

      <div className="space-y-2">
        <Label>Đánh giá của bạn</Label>
        <StarsRow
          value={rating}
          interactive
          onChange={setRating}
          size="lg"
          ariaLabel="Chọn số sao"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reviews-message">Cảm nhận chi tiết</Label>
        <Textarea
          id="reviews-message"
          name="message"
          rows={4}
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm hoặc dịch vụ…"
        />
      </div>

      <div className="flex items-start gap-2">
        <Checkbox id="reviews-photo" name="photo" />
        <Label htmlFor="reviews-photo" className="text-[13px] text-muted-foreground">
          <Camera className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
          Đính kèm ảnh sản phẩm (tùy chọn)
        </Label>
      </div>

      <Button type="submit" disabled={rating === 0 || submitting} className="w-full">
        {submitting ? "Đang gửi…" : submitted ? "Đã gửi — cảm ơn bạn!" : "Gửi đánh giá"}
        {!submitting && !submitted && <Send className="ml-1 h-4 w-4" aria-hidden="true" />}
      </Button>
    </form>
  );
}

/* ========================================================================== *
 * Filter row                                                                 *
 * ========================================================================== */

interface FilterRowProps {
  total: number;
  totalAll: number;
  ratingFilter: RatingFilter;
  onRatingChange: (value: RatingFilter) => void;
  channelFilter: ChannelFilter;
  onChannelChange: (value: ChannelFilter) => void;
  verifiedFilter: VerifiedFilter;
  onVerifiedChange: (value: VerifiedFilter) => void;
}

function FilterRow({
  total,
  totalAll,
  ratingFilter,
  onRatingChange,
  channelFilter,
  onChannelChange,
  verifiedFilter,
  onVerifiedChange,
}: FilterRowProps) {
  return (
    <div className="space-y-3 rounded-xl border border-hairline bg-card p-4 shadow-sm md:p-6">
      <div className="flex items-center justify-between gap-3 text-[14px] text-muted-foreground">
        <span>
          Hiển thị <span className="font-semibold text-foreground">{total}</span> / {totalAll} đánh giá
        </span>
        <span aria-live="polite">Sắp xếp: Mới nhất</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          active={ratingFilter === "all"}
          onClick={() => onRatingChange("all")}
        >
          Tất cả sao
        </FilterChip>
        {([5, 4, 3, 2, 1] as const).map((star) => (
          <FilterChip
            key={star}
            active={ratingFilter === star}
            onClick={() => onRatingChange(star)}
          >
            {star} ★
          </FilterChip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          active={channelFilter === "all"}
          onClick={() => onChannelChange("all")}
        >
          Mọi kênh
        </FilterChip>
        {CHANNEL_OPTIONS.map((channel) => (
          <FilterChip
            key={channel}
            active={channelFilter === channel}
            onClick={() => onChannelChange(channel)}
          >
            {channel}
          </FilterChip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          active={verifiedFilter === "all"}
          onClick={() => onVerifiedChange("all")}
        >
          Tất cả khách
        </FilterChip>
        <FilterChip
          active={verifiedFilter === "verified"}
          onClick={() => onVerifiedChange("verified")}
        >
          Khách đã xác minh
        </FilterChip>
        <FilterChip
          active={verifiedFilter === "guests"}
          onClick={() => onVerifiedChange("guests")}
        >
          Khách mới
        </FilterChip>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-hairline bg-surface text-muted-foreground hover:border-primary hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}

/* ========================================================================== *
 * Review card                                                                *
 * ========================================================================== */

function ReviewCard({ review }: { review: ReviewItem }) {
  const tone = TONE_CLASSES[(review.avatarTone ?? toneFromId(review.id) - 1) % TONE_CLASSES.length];
  const relative = formatRelative(review.createdAt);

  return (
    <article className="space-y-3 rounded-xl border border-hairline bg-card p-5 shadow-sm md:p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={cn(
              "grid h-10 w-10 place-items-center rounded-full text-[15px] font-semibold",
              tone,
            )}
          >
            {avatarInitial(review.author)}
          </span>
          <div className="space-y-0.5">
            <p className="text-[14px] font-semibold leading-tight text-foreground">
              {review.author}
              {review.verified && (
                <BadgeCheck
                  className="ml-1 inline h-4 w-4 text-primary"
                  aria-label="Khách hàng đã xác minh"
                />
              )}
            </p>
            <p className="text-[12px] text-muted-foreground">{relative}</p>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
          {review.channel}
        </span>
      </header>

      <StarsRow value={review.rating} size="sm" />

      <h3 className="text-[16px] font-semibold leading-[1.3] text-foreground">
        {review.title}
      </h3>
      <Quote
        className="-mb-2 h-4 w-4 text-primary/40"
        aria-hidden="true"
      />
      <p className="text-[14px] leading-[1.6] text-muted-foreground">{review.body}</p>
    </article>
  );
}

/* ========================================================================== *
 * Stars row                                                                  *
 * ========================================================================== */

interface StarsRowProps {
  value: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (next: number) => void;
  ariaLabel?: string;
}

function StarsRow({ value, size = "md", interactive, onChange, ariaLabel }: StarsRowProps) {
  const starSize =
    size === "lg" ? "h-5 w-5" : size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const containerSize =
    size === "lg" ? "gap-1.5" : size === "sm" ? "gap-0.5" : "gap-1";

  return (
    <div
      role={interactive ? "radiogroup" : "img"}
      aria-label={ariaLabel ?? `Đánh giá ${value} trên 5 sao`}
      className={cn("flex items-center", containerSize)}
    >
      {[1, 2, 3, 4, 5].map((idx) => {
        const filled = idx <= Math.round(value);
        const half = !filled && idx - 0.5 <= value;
        return interactive ? (
          <button
            key={idx}
            type="button"
            role="radio"
            aria-checked={Math.round(value) === idx}
            aria-label={`${idx} sao`}
            onClick={() => onChange?.(idx)}
            className={cn(
              "grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          >
            <Star
              className={cn(
                starSize,
                filled ? "fill-primary text-primary" : "text-muted-foreground/40",
              )}
              aria-hidden="true"
            />
          </button>
        ) : (
          <Star
            key={idx}
            className={cn(
              starSize,
              filled
                ? "fill-primary text-primary"
                : half
                  ? "fill-primary/50 text-primary"
                  : "text-muted-foreground/40",
            )}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}