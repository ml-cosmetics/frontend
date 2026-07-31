"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Headline, Body, TextLabel } from "@/components/ui/typography";
import { ErrorState } from "@/components/common/error-state";
import { cn } from "@/lib/utils/cn";
import type { APIError } from "@/lib/api";
import { contentApi } from "@/lib/api";
import { queryKeys } from "@/lib/query";
import type { ContentSection } from "@/types";

/**
 * Home-page "About" teaser block.
 *
 * The backend stores a single ContentSection under the key `about`.
 * We pull the title + a trimmed paragraph for the home-page teaser
 * and surface the full page on `/about`. The content is plain text
 * (newlines preserved); paragraph breaks render as double
 * whitespace.
 */
export interface AboutTeaserBlockProps {
  initialData?: ContentSection;
  className?: string;
}

function firstParagraph(content: string | null | undefined, max = 220) {
  if (!content) return "";
  const trimmed = content.trim();
  if (trimmed.length <= max) return trimmed;
  const sliced = trimmed.slice(0, max);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${sliced.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}

export function AboutTeaserBlock({ initialData, className }: AboutTeaserBlockProps) {
  const query = useQuery<ContentSection, APIError>({
    queryKey: queryKeys.content.detail("about"),
    queryFn: () => contentApi.get("about"),
    initialData,
  });

  if (query.isError) {
    return (
      <Section tone="default" spacing="xl" className={className}>
        <Container size="xl">
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        </Container>
      </Section>
    );
  }

  const title = query.data?.title || "Câu chuyện của chúng tôi";
  const teaser = firstParagraph(
    query.data?.content,
    220,
  ) || "Mỗi sản phẩm trong bộ sưu tập Aura Vénus được tuyển chọn thủ công bởi ML Cosmetics — kết hợp giữa nghệ thuật chăm sóc da và đá quý phương Đông.";

  return (
    <Section tone="default" spacing="xl" className={className}>
      <Container size="xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-4">
            <TextLabel level="caps" tone="primary">
              Câu chuyện Aura Vénus
            </TextLabel>
            <Headline as="h2" level="md" className="mt-3">
              {title}
            </Headline>
          </div>
          <div className="md:col-span-8">
            <Body level="lg" className={cn("text-muted-foreground")}>
              {teaser}
            </Body>
            <Button variant="link" asChild className="mt-4 px-0">
              <Link href="/about">
                Đọc thêm về Aura Vénus
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
