import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { PromotionsStitchView } from "@/features/promotions/components/promotions-stitch-view";
import { parsePromotionsContent } from "@/features/promotions/types";
import { contentApi } from "@/lib/api";
import type { ContentSection } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Public Promotions page (`/promotions`).
 *
 * Stitch spec: `Khuyến mãi - ML Cosmetics`.
 *
 * The page renders ONLY the content area between the public shell
 * (which already owns the top nav / marquee / footer / floating
 * bubble) and the footer. The content matches Stitch HTML 1:1:
 *
 *   1. Breadcrumb (Trang chủ → Khuyến mãi).
 *   2. Page header — italic Playfair headline + subline + description.
 *   3. Hero promo banner — gradient pink, "Mùa Lễ Hè 2026" chip,
 *      big italic title, countdown timer, two pill buttons, floating
 *      "Quà tặng" badge.
 *   4. Product grid — 4 cards with discount % badge, favorite overlay,
 *      name, price, cart button.
 *
 * The promotions copy is sourced from `GET /v1/content/promotions`.
 * Admins can paste a `PromotionsContentPayload` JSON document; when
 * the section is empty, the parser falls back to a curated intro so
 * the storefront always shows live promotions.
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const section = await contentApi.get("promotions").catch(() => null);
    return {
      title: "Khuyến mãi",
      description:
        section?.title ??
        "Ưu đãi đang diễn ra tại ML Cosmetics — tuyển tập Aura Rose, son dưỡng Dior, vòng tay ngọc Jadeite và dịch vụ quà tặng.",
    };
  } catch {
    return { title: "Khuyến mãi" };
  }
}

export default async function PromotionsPage() {
  let section: ContentSection | null = null;

  try {
    section = await contentApi.get("promotions");
  } catch {
    // Silently fall back to the canonical intro so the page never
    // renders an error state.
  }

  const { intro } = parsePromotionsContent(section);

  return (
    <Section tone="default" flush containerSize="xl">
      <Container size="xl" className="p-0">
        <PromotionsStitchView intro={intro} />
      </Container>
    </Section>
  );
}