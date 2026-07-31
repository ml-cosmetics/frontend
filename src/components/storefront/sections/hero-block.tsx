import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Display, Body, TextLabel } from "@/components/ui/typography";
import { cn } from "@/lib/utils/cn";
import type { Settings } from "@/types";

/**
 * Hero block for the public home page.
 *
 * Stitch spec:
 *  - Generous top + bottom space (`stack-xl` 64 px)
 *  - Display typography on the left, marketing copy below
 *  - Primary CTA + secondary CTA
 */
export interface HeroBlockProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  settings?: Settings;
  className?: string;
}

export function HeroBlock({
  title,
  eyebrow,
  subtitle,
  primaryHref = "/products",
  primaryLabel = "Khám phá sản phẩm",
  secondaryHref = "/about",
  secondaryLabel = "Câu chuyện thương hiệu",
  settings,
  className,
}: HeroBlockProps) {
  const brand = settings?.company_name || "ML Cosmetics";
  return (
    <Section
      tone="default"
      spacing="xl"
      containerSize="xl"
      className={cn("relative overflow-hidden", className)}
    >
      <Container size="xl" className="space-y-6 md:space-y-8">
        {eyebrow && (
          <TextLabel level="caps" tone="primary">
            {eyebrow}
          </TextLabel>
        )}
        <Display as="h1" level="lg" className="max-w-3xl text-balance">
          {title}
        </Display>
        {subtitle && (
          <Body level="lg" className="max-w-2xl text-muted-foreground">
            {subtitle}
          </Body>
        )}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button asChild>
            <Link href={primaryHref}>
              {primaryLabel}
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        </div>
        <TextLabel level="sm" tone="muted" className="pt-2">
          {brand} · {settings?.phone ? `Hotline ${settings.phone}` : "Mỹ phẩm chính hãng"}
        </TextLabel>
      </Container>
    </Section>
  );
}
