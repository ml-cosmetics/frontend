import type { ContentSection } from "@/types";
import type { FaqContentPayload, FaqGroup } from "../types";

/**
 * Parse the canonical `faq` content section into a structured payload.
 *
 * The backend stores `content` as plain text (see `ContentSection`).
 * Admins that want a richer FAQ author a JSON document with the
 * `FaqContentPayload` shape and paste it into the content editor —
 * the parser detects the JSON and returns the structured groups.
 * Anything else falls back to a single "Câu hỏi thường gặp" group
 * built from the raw paragraphs so the page never renders empty.
 */
export function parseFaqContent(section: ContentSection | null | undefined): FaqGroup[] {
  if (!section) return [];

  const raw = section.content?.trim() ?? "";

  if (raw.startsWith("{")) {
    try {
      const parsed = JSON.parse(raw) as Partial<FaqContentPayload>;
      if (parsed && Array.isArray(parsed.groups)) {
        return parsed.groups.map((group, groupIdx) => ({
          category: group.category?.trim() || `Nhóm ${groupIdx + 1}`,
          description: group.description?.trim() || undefined,
          items: (group.items ?? []).flatMap((item, itemIdx) => {
            const question = item.question?.trim();
            const answer = item.answer?.trim();
            if (!question || !answer) return [];
            return [
              {
                id: `${groupIdx}-${itemIdx}-${slug(question)}`,
                question,
                answer,
              },
            ];
          }),
        })).filter((group) => group.items.length > 0);
      }
    } catch {
      // Fall through to plain-text parsing.
    }
  }

  const title = section.title?.trim() || "Câu hỏi thường gặp";
  const items = raw
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .flatMap((paragraph, idx) => {
      const split = paragraph.split(/\n+/);
      const question = split[0]?.replace(/^\s*Q\s*[:.-]\s*/i, "").trim();
      const answer = split.slice(1).join("\n").trim();
      if (!question) return [];
      return [
        {
          id: `legacy-${idx}-${slug(question)}`,
          question,
          answer: answer || "Vui lòng liên hệ Aura Vénus để được tư vấn chi tiết.",
        },
      ];
    });

  if (items.length === 0) return [];

  return [
    {
      category: title,
      description: section.title ? undefined : "Tổng hợp các câu hỏi thường gặp từ khách hàng.",
      items,
    },
  ];
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