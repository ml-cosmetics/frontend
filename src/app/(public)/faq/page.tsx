import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { FaqStitchView } from "@/features/faq/components/faq-stitch-view";
import { parseFaqContent } from "@/features/faq/api";
import type { FaqGroup } from "@/features/faq/types";
import { contentApi, settingsApi } from "@/lib/api";
import type { ContentSection } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Public FAQ page (`/faq`).
 *
 * Stitch spec: `Hỏi đáp - ML Cosmetics`.
 *
 * The page renders ONLY the content area between the public shell
 * (which already owns the top marquee / nav / footer / floating
 * bubble) and the footer. The content matches Stitch HTML 1:1:
 *
 *   1. Hero with `help` glyph + sparkle-text headline + search bar.
 *   2. Horizontal category chips.
 *   3. Two-column body: glass-card accordion (left) + sticky
 *      support card (right).
 *   4. Quick links grid.
 *   5. CTA card with "Trò chuyện trực tiếp" button.
 *
 * The FAQ copy is sourced from `GET /v1/content/faq`. Admins can
 * paste a `FaqContentPayload` JSON document or leave it blank — the
 * view falls back to the canonical Stitch defaults so the storefront
 * never looks empty.
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const [settings, faq] = await Promise.all([
      settingsApi.get(),
      contentApi.get("faq").catch(() => null),
    ]);
    return {
      title: "Hỏi đáp",
      description:
        faq?.title ??
        settings.seo_description ??
        "Trung tâm hỗ trợ ML Cosmetics — giải đáp câu hỏi về tuyển tập Aura Rose, son dưỡng Dior, vòng tay ngọc Jadeite.",
    };
  } catch {
    return { title: "Hỏi đáp" };
  }
}

const DEFAULT_FAQ_GROUPS: FaqGroup[] = [
  {
    category: "Sản phẩm",
    description: "Về ngọc Jadeite, son dưỡng Dior và các bộ sưu tập Aura Rose.",
    items: [
      {
        id: "sp-1",
        question: "Ngọc Jadeite có thật không? Làm sao kiểm tra?",
        answer:
          "Sản phẩm của chúng tôi sử dụng ngọc Jadeite Myanmar tự nhiên 100%. Mỗi sản phẩm cao cấp đều đi kèm chứng nhận GRA quốc tế hoặc kiểm định PNJ. Khách hàng có thể dùng mã số trên chứng thư để tra cứu trực tuyến hoặc mang đến trung tâm kiểm định độc lập để xác minh.",
      },
    ],
  },
  {
    category: "Đặt hàng",
    items: [
      {
        id: "dh-1",
        question: "Làm sao để đặt lịch tư vấn 1-1 với Aura Rose?",
        answer:
          "Quý khách có thể đặt lịch qua Zalo OA hoặc gửi email cho đội ngũ ML Cosmetics. Chuyên viên tư vấn sẽ liên hệ trong vòng 24 giờ để sắp xếp buổi hẹn tại showroom hoặc video call.",
      },
    ],
  },
  {
    category: "Vận chuyển",
    items: [
      {
        id: "vc-1",
        question: "Phí vận chuyển?",
        answer:
          "Miễn phí vận chuyển toàn quốc cho đơn từ 1.500.000 VNĐ. Đơn dưới mức này áp dụng phí 30.000 VNĐ nội thành và 50.000 VNĐ các tỉnh thành khác. Đóng gói cao cấp hộp nhung kèm thiệp viết tay theo yêu cầu.",
      },
    ],
  },
  {
    category: "Đổi trả",
    items: [
      {
        id: "dt-1",
        question: "Bảo hành và đổi trả trong 7 ngày?",
        answer:
          "Khách hàng được đổi trả trong vòng 7 ngày kể từ ngày nhận hàng với điều kiện sản phẩm còn nguyên tem mác, chưa qua sử dụng. Aura Rose cam kết bảo hành trọn đời độ tinh khiết của ngọc Jadeite.",
      },
    ],
  },
  {
    category: "Thanh toán",
    items: [
      {
        id: "tt-1",
        question: "Hỗ trợ những phương thức thanh toán nào?",
        answer:
          "Chúng tôi hỗ trợ thanh toán khi nhận hàng (COD), chuyển khoản ngân hàng, ví MoMo, ZaloPay và thẻ tín dụng quốc tế qua cổng Stripe.",
      },
    ],
  },
  {
    category: "Bảo hành",
    items: [
      {
        id: "bh-1",
        question: "Vòng tay 14mm phù hợp cổ tay nào?",
        answer:
          "Vòng tay hạt 14mm phù hợp với cổ tay nữ từ 14-16cm. Đối với cổ tay nhỏ hơn, vui lòng liên hệ Aura Rose để được tư vấn size phù hợp.",
      },
    ],
  },
];

export default async function FaqPage() {
  let section: ContentSection | null = null;

  try {
    section = await contentApi.get("faq");
  } catch {
    // Silently fall back to the canonical Stitch defaults so the
    // storefront never renders empty.
  }

  const groups = parseFaqContent(section);
  const supportGroups = groups.length > 0 ? groups : DEFAULT_FAQ_GROUPS;

  return (
    <Section tone="default" flush containerSize="xl">
      <Container size="xl" className="p-0">
        <FaqStitchView groups={supportGroups} />
      </Container>
    </Section>
  );
}