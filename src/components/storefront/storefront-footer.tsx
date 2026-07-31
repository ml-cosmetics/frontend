import * as React from "react";
import Link from "next/link";
import {
  Mail,
  MapPin,
  Phone,
  Clock,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { TextLabel } from "@/components/ui/typography";
import { cn } from "@/lib/utils/cn";
import type { Settings } from "@/types";

/**
 * Storefront footer.
 *
 * Pulled from `GET /v1/settings` so phone / email / address / social /
 * working-hours stay in sync with the brand record. Hard-coded links
 * are used for the navigation grid because they live in this surface
 * only (no API equivalent).
 */
export interface StorefrontFooterProps {
  settings: Settings;
  className?: string;
}

export function StorefrontFooter({ settings, className }: StorefrontFooterProps) {
  const year = new Date().getFullYear();
  const brandLabel = settings.company_name || "ML Cosmetics";

  return (
    <footer
      className={cn("border-t border-hairline bg-surface-container text-foreground", className)}
    >
      <Container size="xl" className="py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="space-y-3">
            <Logo size="md" label={brandLabel} href="/" />
            {settings.address && (
              <p className="max-w-xs text-[14px] leading-relaxed text-muted-foreground">
                {settings.address}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <TextLabel level="caps" tone="default">
              Liên hệ
            </TextLabel>
            <ul className="space-y-2 text-[14px]">
              {settings.phone && (
                <li>
                  <a
                    href={`tel:${settings.phone}`}
                    className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.email && (
                <li>
                  <a
                    href={`mailto:${settings.email}`}
                    className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.working_hours && (
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{settings.working_hours}</span>
                </li>
              )}
              {settings.address && (
                <li className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{settings.address}</span>
                </li>
              )}
            </ul>
          </div>

          <div className="space-y-3">
            <TextLabel level="caps" tone="default">
              Cửa hàng
            </TextLabel>
            <ul className="space-y-2 text-[14px]">
              <li>
                <Link href="/products" className="text-muted-foreground transition-colors hover:text-primary">
                  Tất cả sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground transition-colors hover:text-primary">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground transition-colors hover:text-primary">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <TextLabel level="caps" tone="default">
              Mạng xã hội
            </TextLabel>
            <ul className="flex flex-wrap items-center gap-2">
              {settings.facebook_url && (
                <li>
                  <a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Facebook"
                    className="grid h-10 w-10 place-items-center rounded-full border border-hairline bg-surface text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Facebook className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              )}
              {settings.instagram_url && (
                <li>
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Instagram"
                    className="grid h-10 w-10 place-items-center rounded-full border border-hairline bg-surface text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Instagram className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              )}
              {settings.youtube_url && (
                <li>
                  <a
                    href={settings.youtube_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="YouTube"
                    className="grid h-10 w-10 place-items-center rounded-full border border-hairline bg-surface text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Youtube className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              )}
              {settings.messenger_url && (
                <li>
                  <a
                    href={settings.messenger_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Messenger"
                    className="grid h-10 w-10 place-items-center rounded-full border border-hairline bg-surface text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              )}
              {settings.zalo_url && (
                <li>
                  <a
                    href={settings.zalo_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Zalo"
                    className="grid h-10 w-10 place-items-center rounded-full border border-hairline bg-surface text-[12px] font-semibold uppercase text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Zalo
                  </a>
                </li>
              )}
              {settings.tiktok_url && (
                <li>
                  <a
                    href={settings.tiktok_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="TikTok"
                    className="grid h-10 w-10 place-items-center rounded-full border border-hairline bg-surface text-[12px] font-semibold uppercase text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    TT
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-hairline pt-6 text-[12px] text-muted-foreground md:flex-row md:items-center">
          <p>
            © {year} {brandLabel}. Mọi quyền được bảo lưu.
          </p>
          <p>Thiết kế bởi Aura Vénus · Phát triển bởi ML Cosmetics</p>
        </div>
      </Container>
    </footer>
  );
}

StorefrontFooter.displayName = "StorefrontFooter";
