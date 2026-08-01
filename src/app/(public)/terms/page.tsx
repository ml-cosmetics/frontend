import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { Body, TextLabel, Headline } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
  TermsView,
  type TermsSection as PolicySection,
} from "@/features/terms/components/terms-view";
import { parseTermsContent } from "@/features/terms/types";
import { PoliciesCTAStrip } from "@/features/terms/components/policies-cta-strip";
import { PoliciesConciergeFab } from "@/features/terms/components/policies-concierge-fab";
import { contentApi, settingsApi } from "@/lib/api";
import type { ContentSection, Settings } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Public Terms of Service page (`/terms`).
 *
 * Stitch spec: `Chính sách & Điều khoản | Aura Rose - ML Cosmetics`.
 *
 * Composition (matches Stitch HTML 1:1):
 *   1. Editorial hero with shield-locked glyph + sparkle accents.
 *   2. Two-column layout: sticky pill anchor nav (left) + scrollable
 *      section cards with bg watermarks and `check_circle` bullets
 *      (right). Scroll-spy keeps the nav in sync.
 *   3. CTA strip with Messenger / Zalo / Hotline buttons.
 *
 * The page content is sourced from `GET /v1/content/terms`. Admins
 * can paste a structured `TermsContentPayload` JSON document or
 * leave it blank — the parser falls back to the canonical Stitch
 * defaults so the storefront never looks empty.
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const [settings, terms] = await Promise.all([
      settingsApi.get(),
      contentApi.get("terms").catch(() => null),
    ]);
    return {
      title: "Chính sách & Điều khoản",
      description:
        terms?.title ??
        settings.seo_description ??
        "Chính sách và điều khoản của ML Cosmetics — quyền lợi và nghĩa vụ của khách hàng khi mua sắm tại hệ thống Aura Rose.",
    };
  } catch {
    return { title: "Chính sách & Điều khoản" };
  }
}

const DEFAULT_POLICY_SECTIONS: PolicySection[] = [
  {
    id: "bao-hanh",
    title: "Chính sách bảo hành",
    icon: "verified",
    summary:
      "Aura Rose cam kết chất lượng tuyệt đối cho mọi sản phẩm. Chúng tôi hiểu rằng niềm tin của khách hàng là tài sản quý giá nhất.",
    bullets: [
      "Cam kết bảo hành trọn đời độ tinh khiết của ngọc Jadeite.",
      "Bảo hành 1 đổi 1 trong vòng 30 ngày đối với lỗi do nhà sản xuất (hộp vỡ, vòi xịt hỏng).",
    ],
    paragraphs: [],
  },
  {
    id: "doi-tra",
    title: "Chính sách đổi trả",
    icon: "assignment_return",
    summary:
      "Quy trình đổi trả được thiết kế để đảm bảo sự thuận tiện tối đa cho quý khách, đồng thời duy trì tiêu chuẩn vệ sinh và chất lượng mỹ phẩm.",
    bullets: [
      "Thời hạn đổi trả: Trong vòng 7 ngày kể từ ngày nhận hàng.",
      "Điều kiện: Sản phẩm yêu cầu phải còn nguyên tem mác, chưa qua sử dụng và còn đủ hộp/phụ kiện đi kèm.",
    ],
    paragraphs: [],
  },
  {
    id: "van-chuyen",
    title: "Chính sách vận chuyển",
    icon: "local_shipping",
    summary:
      "ML Cosmetics đóng gói và vận chuyển tỉ mỉ để sản phẩm đến tay khách hàng trong tình trạng hoàn hảo.",
    bullets: [
      "Thời gian giao hàng tiêu chuẩn: 2-4 ngày trên toàn quốc.",
      "Ưu đãi: Miễn phí vận chuyển cho mọi đơn hàng từ 1.500.000 VNĐ.",
      "Đóng gói cao cấp: Mọi đơn hàng đều được đóng gói tỉ mỉ trong hộp quà tặng sang trọng, kèm thiệp viết tay theo yêu cầu.",
    ],
    paragraphs: [],
  },
  {
    id: "bao-mat",
    title: "Chính sách bảo mật",
    icon: "security",
    summary:
      "Mọi thông tin cá nhân và lịch sử mua sắm của khách hàng được bảo vệ theo tiêu chuẩn bảo mật quốc tế.",
    bullets: [
      "Thông tin thanh toán được mã hóa qua cổng Stripe và VnPay — chúng tôi không lưu thẻ.",
      "Không chia sẻ dữ liệu khách hàng cho bên thứ ba ngoài đơn vị vận chuyển.",
    ],
    paragraphs: [],
  },
  {
    id: "dieu-khoan",
    title: "Điều khoản sử dụng",
    icon: "gavel",
    summary:
      "Bằng việc sử dụng website và dịch vụ của ML Cosmetics, khách hàng đồng ý với các điều khoản được nêu dưới đây.",
    bullets: [
      "ML Cosmetics có quyền từ chối phục vụ nếu phát hiện hành vi gian lận hoặc vi phạm điều khoản.",
      "Mọi tranh chấp phát sinh được giải quyết theo pháp luật hiện hành của Việt Nam tại Tp. Hồ Chí Minh.",
    ],
    paragraphs: [],
  },
  {
    id: "huong-dan",
    title: "Hướng dẫn mua hàng",
    icon: "shopping_cart_checkout",
    summary:
      "Quy trình mua sắm đơn giản — chỉ với vài thao tác, bạn đã hoàn tất đơn hàng đầu tiên tại ML Cosmetics.",
    bullets: [
      "Chọn sản phẩm trong bộ sưu tập, thêm vào giỏ và tiến hành thanh toán.",
      "Đội ngũ tư vấn sẽ liên hệ xác nhận trong vòng 24 giờ qua Zalo hoặc điện thoại.",
    ],
    paragraphs: [],
  },
];

export default async function TermsPage() {
  let section: ContentSection | null = null;
  let settings: Settings | null = null;

  try {
    [section, settings] = await Promise.all([
      contentApi.get("terms"),
      settingsApi.get().catch(() => null),
    ]);
  } catch {
    // Silently fall back to canonical Stitch defaults so the page
    // never renders an error state.
  }

  const parsed = parseTermsContent(section);
  const sections: PolicySection[] =
    parsed.sections.length > 0 ? parsed.sections : DEFAULT_POLICY_SECTIONS;
  const intro = parsed.intro;
  const lastUpdated = "15/07/2026";

  return (
    <>
      <Section tone="default" flush containerSize="xl">
        <Container size="xl" className="p-0">
          <TermsView
            intro={intro}
            sections={sections}
            variant="policies"
            lastUpdated={lastUpdated}
          />
        </Container>
      </Section>

      <Section tone="default" flush containerSize="xl">
        <Container size="xl" className="p-0">
          <PoliciesCTAStrip />
        </Container>
      </Section>

      {/* =========================== SUPPORT FOOTER =========================== */}
      <Section tone="default" spacing="lg" containerSize="xl">
        <Container size="lg">
          <div className="grid gap-6 rounded-xl border border-hairline bg-card p-6 md:grid-cols-2 md:p-10">
            <div className="space-y-2">
              <TextLabel level="caps" tone="primary" className="block">
                Vẫn chưa rõ?
              </TextLabel>
              <Headline as="h2" level="md">
                Chúng tôi ở đây để giúp bạn
              </Headline>
              <Body className="text-muted-foreground">
                Gửi email cho đội ngũ ML Cosmetics, chúng tôi sẽ phản hồi trong
                vòng 24 giờ.
              </Body>
            </div>
            <div className="flex flex-col gap-3">
              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-[14px] font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {settings.email}
                </a>
              )}
              <Button asChild variant="outline">
                <Link href="/contact">Tới trang liên hệ</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* =========================== FLOATING CONCIERGE FAB =========================== */}
      <PoliciesConciergeFab />
    </>
  );
}