import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { Body, TextLabel, Headline } from "@/components/ui/typography";
import { IconActionCard } from "@/components/ui/icon-action-card";
import { Button } from "@/components/ui/button";
import { AnnouncementMarquee } from "@/components/layout/announcement-marquee";
import { ReviewsStitchView } from "@/features/reviews/components/reviews-stitch-view";
import { parseReviewsContent } from "@/features/reviews/types";
import { contentApi } from "@/lib/api";
import { Sparkles, Award, ShieldCheck } from "lucide-react";
import type { ContentSection } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Public Reviews page (`/reviews`).
 *
 * Stitch spec: `Đánh giá - Aura Rose | ML Cosmetics`.
 *
 * Composition:
 *   1. Top marquee (review stats strip).
 *   2. Stitch hero — `spark` glyph + Playfair italic headline +
 *      count badge.
 *   3. Masonry grid of review cards (no filter UI / form / pagination
 *      — matches the Stitch HTML "simplified for effort level 0.25").
 *   4. Bottom CTA strip with 3 trust badges + showroom invitation.
 *
 * The reviews are sourced from `GET /v1/content/reviews`. The parser
 * falls back to a curated set of hand-written fixtures so the page
 * never renders empty.
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const section = await contentApi.get("reviews").catch(() => null);
    return {
      title: "Đánh giá",
      description:
        section?.title ??
        "Khách hàng nói gì về ML Cosmetics — đánh giá thật từ người đã mua sắm tại showroom và website.",
    };
  } catch {
    return { title: "Đánh giá" };
  }
}

export default async function ReviewsPage() {
  let section: ContentSection | null = null;

  try {
    section = await contentApi.get("reviews");
  } catch {
    // Silently fall back to canonical Stitch defaults so the page
    // never renders an error state.
  }

  const { stats, items } = parseReviewsContent(section);

  return (
    <>
      <Section tone="default" flush containerSize="xl">
        <Container size="xl" className="p-0">
          <AnnouncementMarquee
            messages={[
              `${stats.total.toLocaleString("vi-VN")} đánh giá thật — không sửa, không lọc • Freeship toàn quốc • Kiểm định quốc tế • 100% Ngọc Jadeite tự nhiên`,
            ]}
            className="mt-0 bg-primary text-xs uppercase tracking-wide"
          />
        </Container>
      </Section>

      {/* =========================== REVIEWS =========================== */}
      <Section tone="default" spacing="xl" containerSize="xl">
        <Container size="xl">
          <ReviewsStitchView stats={stats} items={items} />
        </Container>
      </Section>

      {/* =========================== BOTTOM CTA =========================== */}
      <Section tone="muted" spacing="lg" containerSize="xl">
        <Container size="lg">
          <div className="grid gap-6 rounded-xl border border-hairline bg-card p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-10">
            <div className="space-y-2">
              <TextLabel level="caps" tone="primary" className="block">
                Ghé showroom
              </TextLabel>
              <Headline as="h2" level="md">
                Trải nghiệm trực tiếp các tuyển tập Aura Rose
              </Headline>
              <Body className="text-muted-foreground">
                ML Cosmetics và đội ngũ tư vấn sẵn sàng đón tiếp bạn tại cửa hàng.
                Vui lòng đặt lịch trước để chúng tôi chuẩn bị chu đáo.
              </Body>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <IconActionCard
                  icon={<Sparkles className="h-4 w-4" />}
                  title="100% chính hãng"
                  compact
                />
                <IconActionCard
                  icon={<Award className="h-4 w-4" />}
                  title={`${stats.total.toLocaleString("vi-VN")} đánh giá`}
                  compact
                />
                <IconActionCard
                  icon={<ShieldCheck className="h-4 w-4" />}
                  title="Đổi trả 30 ngày"
                  compact
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
              <Button asChild>
                <Link href="/contact">Đặt lịch tham quan</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/products">Xem sản phẩm</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}