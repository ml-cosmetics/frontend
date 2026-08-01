import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { AboutStitchView } from "@/features/about/components/about-stitch-view";
import { contentApi } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Public About page (`/about`).
 *
 * Stitch source-of-truth: `Về ML Cosmetics - Aura Rose Collection`.
 * The page renders only the content area between the public shell
 * (top nav / marquee / footer) and the footer. Everything above and
 * below stays identical to the homepage shell.
 *
 * Composed sections (rendered by `AboutStitchView`):
 *   1. Hero — eyebrow + Playfair italic headline + body + ✨ glyph.
 *   2. Founder card — Mỹ Lệ portrait + bio + blockquote.
 *   3. Timeline — 5 milestones (2021 → 2026).
 *   4. Values grid — 4 cards (Chân Thật / Tư Vấn 1:1 / Bảo Hành /
 *      Cộng Đồng).
 *   5. Craft story — 3 alternating process steps with images.
 *   6. Team grid — 3 members.
 *   7. Stats strip — 4 numbers (khách hàng, đánh giá, thiết kế, năm).
 *   8. CTA strip — Khám phá + Liên hệ tư vấn.
 *
 * The optional `GET /v1/content/about` content section is fetched
 * for metadata (SEO title + description) but the visible layout is
 * driven entirely by the Stitch spec — no admin-editable copy
 * regions are exposed.
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const about = await contentApi.get("about").catch(() => null);
    return {
      title: "Về ML Cosmetics",
      description:
        about?.title ??
        "Câu chuyện ML Cosmetics — Mỹ Lệ sáng lập, ngọc cẩm thạch Myanmar, chứng nhận GRA quốc tế.",
    };
  } catch {
    return { title: "Về ML Cosmetics" };
  }
}

export default function AboutPage() {
  return (
    <Section tone="default" flush containerSize="xl">
      <Container size="xl" className="p-0">
        <AboutStitchView />
      </Container>
    </Section>
  );
}