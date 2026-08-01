import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { ContactStitchView } from "@/features/contact/components/contact-stitch-view";
import { settingsApi } from "@/lib/api/settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Liên hệ",
    description:
      "Liên hệ ML Cosmetics — Messenger, Zalo, Instagram, hotline 1900 6868 hoặc gửi tin nhắn trực tiếp.",
  };
}

export default async function ContactPage() {
  let settings = null;
  try {
    settings = await settingsApi.get();
  } catch {
    // fallback
  }

  return (
    <Section tone="default" flush containerSize="xl">
      <Container size="xl" className="p-0">
        <ContactStitchView settings={settings} />
      </Container>
    </Section>
  );
}