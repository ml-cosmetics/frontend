import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/providers";
import { BackToTop } from "@/components/common/back-to-top";
import { settingsApi } from "@/lib/api";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Generate root metadata (title, description, OG, icons). Pulls
 * brand-specific values from `GET /v1/settings` so the SEO record
 * matches the active brand record without redeploys.
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await settingsApi.get();
    return {
      title: {
        default: settings.seo_title ?? settings.company_name ?? "ML Cosmetics",
        template: `%s · ${settings.company_name ?? "ML Cosmetics"}`,
      },
      description:
        settings.seo_description ??
        "Mỹ phẩm chính hãng — thương hiệu Việt.",
      keywords: settings.seo_keywords ?? undefined,
      metadataBase: new URL(SITE_URL),
      openGraph: {
        siteName: settings.company_name ?? "ML Cosmetics",
        title: settings.seo_title ?? settings.company_name ?? "ML Cosmetics",
        description:
          settings.seo_description ??
          "Mỹ phẩm chính hãng — thương hiệu Việt.",
        images: settings.logo_url ? [{ url: settings.logo_url }] : undefined,
        locale: "vi_VN",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: settings.seo_title ?? settings.company_name ?? "ML Cosmetics",
        description: settings.seo_description ?? undefined,
        images: settings.logo_url ? [settings.logo_url] : undefined,
      },
      icons: {
        icon: settings.favicon_url ?? "/favicon.ico",
      },
    };
  } catch {
    return {
      title: {
        default: "ML Cosmetics",
        template: "%s · ML Cosmetics",
      },
      description: "Mỹ phẩm chính hãng — thương hiệu Việt.",
      metadataBase: new URL(SITE_URL),
      icons: { icon: "/favicon.ico" },
    };
  }
}

export const viewport: Viewport = {
  themeColor: "#fbf8fc",
};

/**
 * Root layout. Hosts the global provider tree (theme, query, auth,
 * toast) and the global CSS. The two route groups — `(public)` and
 * `(admin)` — render their own `<html>` / `<body>` skins inside the
 * layouts below.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* eslint-disable-next-line @next/next/google-font-display, @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AppProviders>
          {children}
          <BackToTop />
        </AppProviders>
      </body>
    </html>
  );
}
