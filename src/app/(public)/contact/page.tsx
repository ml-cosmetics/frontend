import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { ContactStitchView } from "@/features/contact/components/contact-stitch-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Public Contact page (`/contact`).
 *
 * Stitch source-of-truth: `Liên hệ - ML Cosmetics`.
 * The page renders only the content area between the public shell
 * (top nav / marquee / footer / floating bubble) and the footer.
 * Channel data (Messenger / Zalo / Instagram / Hotline) is sourced
 * from `GET /v1/settings` so admins can update it without touching
 * code.
 *
 * Page-level components referenced in the Stitch HTML are
 * implemented inside `ContactStitchView`:
 *   - Hero (favorite ring + Playfair headline)
 *   - Channel cards 2x2 (Messenger, Zalo, IG, Hotline)
 *   - Form + Info card (60/40 split) with floating labels
 *   - FAQ quick links
 *   - Map section
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Liên hệ",
    description:
      "Liên hệ ML Cosmetics — Messenger, Zalo, Instagram, hotline 1900 6868 hoặc gửi tin nhắn trực tiếp.",
  };
}

export default function ContactPage() {
  return (
    <Section tone="default" flush containerSize="xl">
      <Container size="xl" className="p-0">
        <ContactStitchView />
      </Container>
    </Section>
  );
}