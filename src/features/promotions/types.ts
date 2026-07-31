/**
 * Domain types for the public Promotions page.
 *
 * Promotions are sourced from the `promotions` content key. Admins
 * paste a structured `PromotionsContentPayload` JSON document that
 * describes the hero pair + the smaller card grid; the parser renders
 * both. When admins haven't authored any promotions yet, a curated
 * set of fixtures is rendered so the storefront is always live.
 */
import type { ContentSection } from "@/types";

export type PromotionStatus = "live" | "upcoming" | "ended";

export interface PromotionItem {
  id: string;
  /** Short label shown on the card (max ~24 chars). */
  eyebrow: string;
  /** Big title shown on the card. */
  title: string;
  /** Optional supporting description. */
  description?: string;
  /** ISO-8601 start timestamp. */
  startsAt: string;
  /** ISO-8601 end timestamp. */
  endsAt: string;
  /** Public destination — usually a `/products` filter or category page. */
  href: string;
  /** Tonal preset for the hero card background (1..4). */
  tone?: 1 | 2 | 3 | 4;
  /** Marketing discount tag — e.g. "−30%" or "Mua 2 tặng 1". */
  badge?: string;
}

export interface PromotionsContentPayload {
  intro?: { title?: string; subtitle?: string };
  hero?: PromotionItem[];
  cards?: PromotionItem[];
}

export interface ParsedPromotions {
  intro: { title: string; subtitle: string };
  hero: PromotionItem[];
  cards: PromotionItem[];
}

const DEFAULT_HERO: PromotionItem[] = [
  {
    id: "fallback-hero-1",
    eyebrow: "Độc quyền trực tuyến",
    title: "Tuần lễ Aura Rose — Son dưỡng Dior giảm 25%",
    description:
      "Áp dụng cho toàn bộ dòng Dior Addict Lip Glow và Rouge Dior. Trả góp 0% với đơn từ 2.500.000đ.",
    startsAt: "2025-01-15T00:00:00Z",
    endsAt: "2099-12-31T23:59:59Z",
    href: "/products?category=son-duong",
    tone: 1,
    badge: "−25%",
  },
  {
    id: "fallback-hero-2",
    eyebrow: "Bộ sưu tập giới hạn",
    title: "Vòng tay Jadeite — Tặng kèm hộp gỗ chạm khắc",
    description:
      "Mua vòng Jadeite thiên nhiên, nhận ngay hộp gỗ chạm khắc tên và thiệp viết tay từ ML Cosmetics.",
    startsAt: "2025-01-10T00:00:00Z",
    endsAt: "2099-12-31T23:59:59Z",
    href: "/products?category=vong-tay-jadeite",
    tone: 2,
    badge: "Quà tặng",
  },
];

const DEFAULT_CARDS: PromotionItem[] = [
  {
    id: "fallback-card-1",
    eyebrow: "Hàng mới về",
    title: "Son dưỡng Dior Addict Lip Glow 2025",
    description: "Bảng màu mới limited — chỉ có tại Aura Vénus.",
    startsAt: "2025-01-08T00:00:00Z",
    endsAt: "2099-12-31T23:59:59Z",
    href: "/products",
    tone: 3,
    badge: "Mới",
  },
  {
    id: "fallback-card-2",
    eyebrow: "Ưu đãi thành viên",
    title: "Tích điểm đổi quà Aura Vénus",
    description: "Mỗi 1.000.000đ = 1 điểm thưởng, đổi quà sau 5 đơn.",
    startsAt: "2025-01-01T00:00:00Z",
    endsAt: "2099-12-31T23:59:59Z",
    href: "/contact",
    tone: 4,
    badge: "Thành viên",
  },
  {
    id: "fallback-card-3",
    eyebrow: "Miễn phí vận chuyển",
    title: "Freeship cho đơn từ 1.500.000đ",
    description: "Áp dụng toàn quốc, giao trong 24h với nội thành Hà Nội và TP.HCM.",
    startsAt: "2025-01-01T00:00:00Z",
    endsAt: "2099-12-31T23:59:59Z",
    href: "/products",
    tone: 1,
    badge: "Freeship",
  },
  {
    id: "fallback-card-4",
    eyebrow: "Quà tặng doanh nghiệp",
    title: "Combo quà Tết cho đối tác",
    description: "Thiết kế riêng, in logo, giao tận nơi — báo giá trong 24h.",
    startsAt: "2024-12-01T00:00:00Z",
    endsAt: "2099-12-31T23:59:59Z",
    href: "/contact",
    tone: 2,
    badge: "B2B",
  },
];

export function parsePromotionsContent(
  section: ContentSection | null | undefined,
): ParsedPromotions {
  const fallback: ParsedPromotions = {
    intro: {
      title: "Ưu đãi đang diễn ra",
      subtitle: "Tổng hợp chương trình khuyến mãi, quà tặng và sự kiện đặc biệt tại Aura Vénus.",
    },
    hero: DEFAULT_HERO,
    cards: DEFAULT_CARDS,
  };

  if (!section) return fallback;

  const raw = section.content?.trim() ?? "";

  if (raw.startsWith("{")) {
    try {
      const parsed = JSON.parse(raw) as Partial<PromotionsContentPayload>;
      const hero = (parsed.hero ?? []).flatMap(mapPromotionItems);
      const cards = (parsed.cards ?? []).flatMap(mapPromotionItems);
      return {
        intro: {
          title: parsed.intro?.title?.trim() || fallback.intro.title,
          subtitle: parsed.intro?.subtitle?.trim() || fallback.intro.subtitle,
        },
        hero,
        cards,
      };
    } catch {
      // Fall through to fallback.
    }
  }

  return fallback;
}

function mapPromotionItems(item: PromotionItem, idx: number): PromotionItem[] {
  const id = item.id?.trim() || `promo-${idx}`;
  const title = item.title?.trim();
  if (!title) return [];
  return [
    {
      id,
      eyebrow: item.eyebrow?.trim() || "Ưu đãi",
      title,
      description: item.description?.trim() || undefined,
      startsAt: item.startsAt || new Date().toISOString(),
      endsAt: item.endsAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      href: item.href?.trim() || "/products",
      tone: item.tone ?? ((idx % 4) + 1) as 1 | 2 | 3 | 4,
      badge: item.badge?.trim() || undefined,
    },
  ];
}

export function statusForPromotion(item: PromotionItem, now = new Date()): PromotionStatus {
  const start = new Date(item.startsAt).getTime();
  const end = new Date(item.endsAt).getTime();
  const current = now.getTime();
  if (current < start) return "upcoming";
  if (current > end) return "ended";
  return "live";
}