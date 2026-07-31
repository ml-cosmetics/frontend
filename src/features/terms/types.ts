/**
 * Domain types for the public Terms of Service page.
 *
 * The backend stores `content` as a string under the `terms` key. To
 * keep the editorial page flexible, admins can paste a JSON payload
 * shaped as {@link TermsContentPayload} and the parser turns it into
 * structured sections. Anything else falls back to plain paragraphs
 * rendered as a single block.
 */
import type { ContentSection } from "@/types";

export interface TermsSection {
  id: string;
  title: string;
  summary?: string;
  paragraphs: string[];
}

export interface TermsIntro {
  title: string;
  body: string[];
}

export interface TermsContentPayload {
  intro?: { title?: string; body?: string[] };
  sections: TermsSection[];
}

export interface ParsedTerms {
  intro: TermsIntro;
  sections: TermsSection[];
}

function slug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function parseTermsContent(
  section: ContentSection | null | undefined,
): ParsedTerms {
  if (!section) {
    return { intro: { title: "Điều khoản dịch vụ", body: [] }, sections: [] };
  }

  const title = section.title?.trim() || "Điều khoản dịch vụ";
  const raw = section.content?.trim() ?? "";

  if (raw.startsWith("{")) {
    try {
      const parsed = JSON.parse(raw) as Partial<TermsContentPayload>;
      if (parsed && Array.isArray(parsed.sections)) {
        return {
          intro: {
            title: parsed.intro?.title?.trim() || title,
            body: (parsed.intro?.body ?? []).map((p) => p.trim()).filter(Boolean),
          },
          sections: parsed.sections.map((s, idx) => {
            const secTitle = s.title?.trim() || `Mục ${idx + 1}`;
            return {
              id: slug(secTitle) || `section-${idx + 1}`,
              title: secTitle,
              summary: s.summary?.trim() || undefined,
              paragraphs: (s.paragraphs ?? []).map((p) => p.trim()).filter(Boolean),
            };
          }),
        };
      }
    } catch {
      // Fall through to plain-text parsing.
    }
  }

  const paragraphs = raw
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return {
    intro: {
      title,
      body:
        paragraphs.length > 0 && paragraphs[0] !== undefined
          ? [paragraphs[0]]
          : [
              "Aura Vénus cam kết mang đến trải nghiệm mua sắm an toàn, minh bạch và tinh tế cho từng khách hàng.",
            ],
    },
    sections: [
      {
        id: "noi-dung",
        title: "Nội dung điều khoản",
        paragraphs:
          paragraphs.length > 1
            ? paragraphs.slice(1)
            : [
                "Nội dung chi tiết đang được ML Cosmetics và đội ngũ Aura Vénus biên soạn. Vui lòng quay lại sau hoặc liên hệ trực tiếp để được tư vấn.",
              ],
      },
    ],
  };
}