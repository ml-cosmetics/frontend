import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Display, Body } from "@/components/ui/typography";
import type { Settings } from "@/types";

/**
 * "Get in touch" CTA on the home page.
 *
 * Brand copy is hard-coded (Stitch spec) but the contact string is
 * read from `Settings.phone` if available, so the visible digits
 * stay consistent with the rest of the site.
 */
export interface ContactCTABlockProps {
  settings?: Settings;
}

export function ContactCTABlock({ settings }: ContactCTABlockProps) {
  return (
    <Section tone="primary" spacing="xl" containerSize="xl">
      <Container size="lg">
        <div className="flex flex-col items-center gap-6 text-center text-primary-foreground">
          <Display as="h2" level="sm" className="text-balance">
            Trò chuyện cùng Aura Vénus
          </Display>
          <Body level="lg" className="max-w-2xl text-primary-foreground/85">
            Hãy gọi cho chúng tôi hoặc ghé cửa hàng — ML Cosmetics và đội ngũ tư vấn luôn sẵn sàng
            giúp bạn chọn món quà phù hợp.
          </Body>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="secondary" size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              <Link href="/contact">
                Liên hệ ngay
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            {settings?.phone && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <a href={`tel:${settings.phone}`}>Gọi {settings.phone}</a>
              </Button>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
