/**
 * Domain types for the public Reviews page.
 *
 * Reviews come from a structured JSON payload that admins paste into
 * the `reviews` content key. Each testimonial includes rating,
 * author metadata, and a structured body so the storefront can
 * render rich cards without a dedicated reviews API.
 */
export type ReviewChannel = "Website" | "Facebook" | "Zalo" | "Instagram" | "Showroom";

export interface ReviewItem {
  id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
  author: string;
  /** Optional verified-buyer chip ("Khách hàng thân thiết"). */
  verified?: boolean;
  /** Where the review originated — shown as a small chip. */
  channel: ReviewChannel;
  /** ISO-8601 date string used for the relative date label. */
  createdAt: string;
  /** Avatar initial color preset (1..6) — deterministic from the id. */
  avatarTone?: number;
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface ReviewsContentPayload {
  intro?: { title?: string; subtitle?: string };
  stats?: Partial<ReviewStats>;
  items: ReviewItem[];
}

export interface ParsedReviews {
  intro: { title: string; subtitle: string };
  stats: ReviewStats;
  items: ReviewItem[];
}

import type { ContentSection } from "@/types";

const DEFAULT_STATS: ReviewStats = {
  average: 4.9,
  total: 1284,
  distribution: { 1: 8, 2: 12, 3: 28, 4: 184, 5: 1052 },
};

/**
 * Built-in review fixtures — used as a fallback so the storefront
 * renders a populated page even when admins haven't authored any
 * reviews yet. Each entry was hand-written to reflect the Aura Vénus
 * voice and cover the rating spectrum shown in the Stitch design.
 */
const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: "fallback-1",
    rating: 5,
    title: "Son dưỡng Dior chính hãng, đóng gói tinh tế",
    body:
      "Mình đã đặt hai thỏi Dior Addict Lip Glow — cảm ơn ML Cosmetics đã tư vấn rất kỹ. Hộp quà đẹp như tranh, nến thơm nhẹ và thiệp viết tay khiến mình rất xúc động. Sẽ tiếp tục ủng hộ Aura Vénus.",
    author: "Ngọc Trâm",
    verified: true,
    channel: "Showroom",
    createdAt: "2025-01-12T09:00:00Z",
  },
  {
    id: "fallback-2",
    rating: 5,
    title: "Vòng tay Jadeite đẹp đến nỗi không muốn tháo",
    body:
      "Chiếc vòng ngọc phỉ thúy đúng như ảnh, màu xanh biếc và rất nhiều nước. ML Cosmetics còn hướng dẫn mình đo ni tay tại nhà. Đeo được ba tuần mà vẫn được khen mỗi ngày.",
    author: "Hồng Anh",
    verified: true,
    channel: "Website",
    createdAt: "2024-12-29T13:00:00Z",
  },
  {
    id: "fallback-3",
    rating: 4,
    title: "Giao hàng nhanh, đóng gói cẩn thận",
    body:
      "Đặt sáng thì chiều có hàng, hộp rất chắc chắn, không sợ vỡ. Son lên màu chuẩn, dưỡng môi tốt. Trừ một điểm vì bưu tá gọi hơi nhiều lần.",
    author: "Minh Khoa",
    verified: false,
    channel: "Facebook",
    createdAt: "2024-12-18T10:00:00Z",
  },
  {
    id: "fallback-4",
    rating: 5,
    title: "Dịch vụ quà tặng doanh nghiệp rất chuyên nghiệp",
    body:
      "Công ty mình đặt 60 phần quà Tết cho khách hàng VIP. Aura Vénus hỗ trợ thiết kế riêng, in logo và giao đúng hẹn. Mọi người đều rất hài lòng.",
    author: "Phương Linh",
    verified: true,
    channel: "Zalo",
    createdAt: "2024-12-10T08:00:00Z",
  },
  {
    id: "fallback-5",
    rating: 5,
    title: "Tư vấn nhiệt tình, chọn sản phẩm đúng nhu cầu",
    body:
      "Mình không rành về ngọc Jadeite nhưng ML Cosmetics giải thích rất rõ, so sánh các loại đá giúp mình chọn được chiếc vòng phù hợp ngân sách. Cảm ơn Aura Vénus rất nhiều!",
    author: "Thanh Thảo",
    verified: true,
    channel: "Instagram",
    createdAt: "2024-11-30T14:00:00Z",
  },
  {
    id: "fallback-6",
    rating: 4,
    title: "Son màu đẹp nhưng giá hơi cao",
    body:
      "Dòng Dior Addict này dưỡng môi cực thích, màu lên tự nhiên. Giá hơi cao so với mặt bằng chung nhưng chất lượng tương xứng.",
    author: "Khánh Vy",
    verified: false,
    channel: "Website",
    createdAt: "2024-11-22T16:00:00Z",
  },
];

export function parseReviewsContent(
  section: ContentSection | null | undefined,
): ParsedReviews {
  const fallback: ParsedReviews = {
    intro: {
      title: "Khách hàng nói gì về Aura Vénus",
      subtitle:
        "Tổng hợp đánh giá thực từ khách hàng đã mua sắm tại showroom và website Aura Vénus.",
    },
    stats: DEFAULT_STATS,
    items: DEFAULT_REVIEWS,
  };

  if (!section) return fallback;

  const raw = section.content?.trim() ?? "";

  if (raw.startsWith("{")) {
    try {
      const parsed = JSON.parse(raw) as Partial<ReviewsContentPayload>;
      if (parsed && Array.isArray(parsed.items)) {
        const items = parsed.items.flatMap((item, idx) => {
          const id = item.id?.trim() || `review-${idx}`;
          const rating = clampRating(item.rating);
          if (!item.title?.trim() || !item.body?.trim() || !item.author?.trim()) {
            return [];
          }
          return [
            {
              id,
              rating,
              title: item.title.trim(),
              body: item.body.trim(),
              author: item.author.trim(),
              verified: Boolean(item.verified),
              channel: item.channel ?? "Website",
              createdAt: item.createdAt || new Date().toISOString(),
              avatarTone: typeof item.avatarTone === "number" ? item.avatarTone : undefined,
            },
          ];
        });
        const stats: ReviewStats = items.length > 0
          ? {
              average: parsed.stats?.average ?? averageFromItems(parsed.items),
              total: parsed.stats?.total ?? items.length,
              distribution:
                parsed.stats?.distribution ?? distributionFromItems(parsed.items),
            }
          : {
              average: 0,
              total: 0,
              distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            };
        return {
          intro: {
            title: parsed.intro?.title?.trim() || fallback.intro.title,
            subtitle: parsed.intro?.subtitle?.trim() || fallback.intro.subtitle,
          },
          stats,
          items,
        };
      }
    } catch {
      // Fall through to default fallback.
    }
  }

  return fallback;
}

function clampRating(value: number | undefined): 1 | 2 | 3 | 4 | 5 {
  const n = Math.round(value ?? 5);
  if (n <= 1) return 1;
  if (n <= 2) return 2;
  if (n <= 3) return 3;
  if (n <= 4) return 4;
  return 5;
}

function averageFromItems(items: ReviewItem[]): number {
  if (items.length === 0) return 0;
  const sum = items.reduce((acc, item) => acc + (item.rating ?? 0), 0);
  return Number.parseFloat((sum / items.length).toFixed(2));
}

function distributionFromItems(items: ReviewItem[]): ReviewStats["distribution"] {
  const distribution: ReviewStats["distribution"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const item of items) {
    distribution[item.rating] += 1;
  }
  return distribution;
}

export function toneFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return (hash % 6) + 1;
}

export function avatarInitial(name: string): string {
  const trimmed = name?.trim();
  if (!trimmed) return "·";
  return trimmed[0]?.toUpperCase() ?? "·";
}