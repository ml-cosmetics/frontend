import type { Metadata } from "next";
import { PublicShell } from "@/components/layout";
import { settingsApi } from "@/lib/api";

/**
 * `(public)` route group. Server-rendered to deliver fast first paint
 * and good SEO. The shell already pre-fetches `Settings` so the
 * footer can render brand data on the very first byte.
 */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await settingsApi.get();
    if (settings.seo_description) {
      return { description: settings.seo_description };
    }
  } catch {
    // Fall through to the default metadata.
  }
  return {};
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialSettings = await settingsApi.get().catch(() => undefined);

  return <PublicShell initialSettings={initialSettings}>{children}</PublicShell>;
}
