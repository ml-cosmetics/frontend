"use client";

import * as React from "react";
import Link from "next/link";
import { useSettings } from "@/features/settings/hooks/use-settings";
import type { Settings } from "@/types";
import { cn } from "@/lib/utils/cn";
import {
  ArrowForward,
  Call,
  CheckCircle,
  FacebookBrand,
  Favorite,
  LocationOn,
  Mail,
  PhotoCamera,
  Schedule,
  SupportAgent,
  ZaloBrand,
} from "@/components/layout/storefront-icons";

/**
 * ContactStitchView — Stitch layout for `/contact`.
 *
 * Matches the `Liên hệ - ML Cosmetics` canvas. Channel data (Messenger / Zalo /
 * Instagram / Facebook / Hotline) and Info card (address, email, phone, hours)
 * are sourced from `GET /v1/settings`.
 */
export function ContactStitchView({ settings: initialSettings }: { settings?: Settings | null }) {
  const { data: clientSettings } = useSettings();
  const settings = initialSettings ?? clientSettings;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-16 px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <Hero />
      <ChannelCards settings={settings} />
      <FormAndInfo settings={settings} />
      <MapSection settings={settings} />
    </main>
  );
}

ContactStitchView.displayName = "ContactStitchView";

/* ----------------------------------------------------------------------- *
 * Hero
 * ----------------------------------------------------------------------- */

function Hero() {
  return (
    <section className="mx-auto max-w-3xl space-y-6 text-center">
      <div className="ring-primary/10 mb-4 inline-flex items-center justify-center rounded-full bg-white p-3 shadow-sm ring-1">
        <Favorite size={32} className="text-3xl text-[#E11D74]" />
      </div>
      <h1 className="font-headline text-4xl italic leading-tight text-[#E11D74] md:text-5xl lg:text-6xl">
        Chúng tôi luôn ở đây — <br />
        <span className="font-normal text-zinc-800">
          Trò chuyện cùng ML Cosmetics
        </span>
      </h1>
      <p className="font-body text-lg text-zinc-600">
        Đội ngũ tư vấn chuyên gia ngọc &amp; son dưỡng phản hồi trong vòng 5 phút.
      </p>
    </section>
  );
}

Hero.displayName = "Hero";

/* ----------------------------------------------------------------------- *
 * Channel cards (Facebook / Zalo / Instagram / Messenger / Hotline).
 * ----------------------------------------------------------------------- */

interface ChannelTile {
  name: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  chipBg: string;
  chipFg: string;
  cta: string;
  ctaColor: string;
  href?: string;
  iconBg: string;
  iconFg: string;
  qr?: string;
  qrCaption?: string;
}

function ChannelCards({ settings }: { settings?: Settings | null }) {
  const tiles: ChannelTile[] = [
    {
      name: "Facebook",
      description: settings?.facebook_url ? "Phản hồi qua Fanpage" : "Chưa cập nhật",
      icon: <FacebookBrand size={28} className="text-[#1877F2]" />,
      gradient: "bg-gradient-to-br from-blue-50 to-blue-100/50",
      chipBg: "bg-blue-100",
      chipFg: "text-[#1877F2]",
      cta: settings?.facebook_url ? "Mở Facebook" : "Chưa cập nhật",
      ctaColor: "text-[#1877F2]",
      href: settings?.facebook_url || undefined,
      iconBg: "bg-blue-100",
      iconFg: "text-[#1877F2]",
    },
    {
      name: "Zalo",
      description: settings?.zalo_url ? "Phản hồi qua Zalo" : "Chưa cập nhật",
      icon: <ZaloBrand size={28} className="text-[#0068FF]" />,
      gradient: "bg-gradient-to-br from-blue-50 to-blue-100/50",
      chipBg: "bg-blue-200",
      chipFg: "text-[#0068FF]",
      cta: settings?.zalo_url ? "Mở Zalo" : "Chưa cập nhật",
      ctaColor: "text-[#0068FF]",
      href: settings?.zalo_url || undefined,
      iconBg: "bg-blue-200",
      iconFg: "text-[#0068FF]",
    },
    {
      name: "Instagram",
      description: settings?.instagram_url ? "Phản hồi qua Instagram" : "Chưa cập nhật",
      icon: <PhotoCamera size={28} className="text-pink-600" />,
      gradient: "bg-gradient-to-br from-pink-50 to-orange-50",
      chipBg: "bg-pink-100",
      chipFg: "text-pink-600",
      cta: settings?.instagram_url ? "Mở Instagram" : "Chưa cập nhật",
      ctaColor: "text-pink-600",
      href: settings?.instagram_url || undefined,
      iconBg: "bg-pink-100",
      iconFg: "text-pink-600",
    },
    {
      name: "Hotline",
      description: settings?.phone ? settings.phone : "Chưa cập nhật",
      icon: <Call size={28} className={settings?.phone ? "text-[#E11D74]" : "text-zinc-400"} />,
      gradient: settings?.phone ? "bg-gradient-to-br from-rose-50 to-rose-100/50" : "bg-gradient-to-br from-zinc-50 to-zinc-100",
      chipBg: settings?.phone ? "bg-rose-100" : "bg-zinc-200",
      chipFg: settings?.phone ? "text-[#E11D74]" : "text-zinc-500",
      cta: settings?.phone ? `Gọi ${settings.phone}` : "Chưa cập nhật",
      ctaColor: settings?.phone ? "text-[#E11D74]" : "text-zinc-500",
      href: settings?.phone ? `tel:${settings.phone}` : undefined,
      iconBg: settings?.phone ? "bg-rose-100" : "bg-zinc-200",
      iconFg: settings?.phone ? "text-[#E11D74]" : "text-zinc-400",
    },
  ];

  return (
    <section className="flex w-full flex-col gap-4">
      <div className="col-span-1 mb-4 text-center md:col-span-2">
        <h2 className="font-display text-2xl font-semibold text-zinc-800">
          Chọn kênh liên hệ bạn yêu thích
        </h2>
      </div>
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
        {tiles.map((tile) => (
          <ChannelTileCard key={tile.name} tile={tile} />
        ))}
      </div>
    </section>
  );
}

ChannelCards.displayName = "ChannelCards";

function ChannelTileCard({ tile }: { tile: ChannelTile }) {
  const isLink = Boolean(tile.href);
  const hasQr = Boolean(tile.qr);
  const isInteractive = isLink || hasQr;
  const external = isLink && tile.href!.startsWith("http");

  const inner = (
    <>
      <div
        className={cn(
          "rounded-full p-3 transition-transform",
          tile.iconBg,
          isLink && "group-hover:scale-110",
        )}
      >
        {tile.icon}
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-zinc-800">
          {tile.name}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
          <Schedule size={16} className="text-[16px] text-green-500" />
          {tile.description}
        </p>
      </div>
      {tile.qr ? (
        <div className="mt-2 flex w-full flex-col items-center gap-2 rounded-2xl border border-white/70 bg-white p-4 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tile.qr}
            alt={tile.qrCaption ?? `QR ${tile.name}`}
            className="h-40 w-40 rounded-lg object-contain"
            loading="lazy"
          />
          {tile.qrCaption && (
            <p className="text-center text-xs font-medium text-zinc-600">
              {tile.qrCaption}
            </p>
          )}
        </div>
      ) : (
        <button
          type="button"
          className={cn(
            "mt-auto flex items-center font-medium transition-transform",
            isLink && "group-hover:translate-x-1",
            tile.ctaColor,
          )}
        >
          {tile.cta}
          <ArrowForward size={16} className="ml-1 text-sm" />
        </button>
      )}
    </>
  );

  const cardClass = cn(
    tile.gradient,
    "group flex flex-col items-start space-y-4 rounded-20px border border-white p-6 shadow-sm transition-shadow",
    isLink
      ? "cursor-pointer hover:shadow-md"
      : isInteractive
        ? ""
        : "cursor-not-allowed opacity-70",
  );

  if (!isLink) {
    return <div className={cardClass}>{inner}</div>;
  }

  return (
    <a
      href={tile.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer noopener" : undefined}
      className={cardClass}
    >
      {inner}
    </a>
  );
}

ChannelTileCard.displayName = "ChannelTileCard";

/* ----------------------------------------------------------------------- *
 * Form + Info (60/40 split)
 * ----------------------------------------------------------------------- */

const SUBJECTS = [
  { value: "ngoc", label: "Ngọc Jadeite" },
  { value: "son", label: "Son Dior" },
  { value: "set", label: "Set quà" },
  { value: "other", label: "Khác" },
];

function FormAndInfo({ settings }: { settings?: Settings | null }) {
  const [form, setForm] = React.useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
    newsletter: false,
  });
  const [submitted, setSubmitted] = React.useState(false);

  const messageLength = form.message.length;

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="flex w-full flex-col items-start gap-8 lg:flex-row lg:gap-12">
      {/* LEFT — Form */}
      <div className="relative w-full overflow-hidden rounded-20px border border-rose-50 bg-white p-8 shadow-lg shadow-rose-100/50 md:p-10 lg:w-[60%]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rose-50 opacity-60 blur-3xl"
        />
        <div className="relative z-10 mb-8">
          <h2 className="font-display mb-2 text-2xl font-bold text-zinc-800">
            Gửi tin nhắn cho ML Cosmetics
          </h2>
          <p className="text-zinc-500">
            Chúng tôi sẽ phản hồi qua email trong vòng 24 giờ làm việc.
          </p>
        </div>
        {submitted ? (
          <div className="border-primary/40 bg-rose-50/40 text-primary relative z-10 rounded-2xl border px-6 py-8 text-sm">
            Cảm ơn bạn đã liên hệ — ML Cosmetics và đội ngũ tư vấn sẽ phản
            hồi trong vòng 24 giờ làm việc. 💌
          </div>
        ) : (
          <form
            className="relative z-10 space-y-6"
            onSubmit={onSubmit}
            noValidate
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FloatField
                id="name"
                label="Họ và tên *"
                required
                value={form.name}
                onChange={(value) => setForm({ ...form, name: value })}
              />
              <FloatField
                id="phone"
                label="Số điện thoại *"
                type="tel"
                required
                value={form.phone}
                onChange={(value) => setForm({ ...form, phone: value })}
              />
            </div>
            <FloatField
              id="email"
              label="Email *"
              type="email"
              required
              value={form.email}
              onChange={(value) => setForm({ ...form, email: value })}
            />
            <FloatSelect
              id="subject"
              label="Bạn quan tâm đến"
              value={form.subject}
              onChange={(value) => setForm({ ...form, subject: value })}
              options={SUBJECTS}
            />
            <FloatTextarea
              id="message"
              label="Lời nhắn"
              value={form.message}
              onChange={(value) => setForm({ ...form, message: value })}
              maxLength={500}
            />
            <div className="text-right text-xs text-zinc-400">
              {messageLength}/500
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={form.newsletter}
                onChange={(event) =>
                  setForm({ ...form, newsletter: event.target.checked })
                }
                className="text-primary h-4 w-4 rounded border-zinc-300 bg-white focus:ring-2 focus:ring-[#E11D74]"
              />
              <span className="ml-2 text-sm text-zinc-600">
                Đăng ký nhận ưu đãi qua email
              </span>
            </label>
            <button
              type="submit"
              className="shadow-rose-200 flex w-full items-center justify-center gap-2 rounded-lg bg-[#E11D74] py-4 text-lg font-medium text-white shadow-md transition-all hover:bg-rose-700 active:scale-[0.98]"
            >
              Gửi tin nhắn 💌
            </button>
          </form>
        )}
      </div>

      {/* RIGHT — Info + FAQ quick links */}
      <div className="flex w-full flex-col gap-6 lg:w-[40%]">
        <InfoCard settings={settings} />
        <FaqQuickLinksCard />
      </div>
    </section>
  );
}

FormAndInfo.displayName = "FormAndInfo";

interface FloatFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel";
  required?: boolean;
}

function FloatField({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
}: FloatFieldProps) {
  const has = value.length > 0;
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        placeholder=" "
        className="peer block w-full appearance-none rounded-lg border-zinc-200 bg-transparent px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-[#E11D74] focus:outline-none focus:ring-0"
      />
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute top-1/2 z-10 origin-[0] -translate-y-1/2 bg-white px-2 text-sm text-zinc-500 transition-all duration-300",
          "peer-placeholder-shown:translate-y-[-50%] peer-placeholder-shown:scale-100",
          "peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-[#E11D74]",
          has && "top-2 scale-75 -translate-y-4 text-[#E11D74]",
        )}
      >
        {label}
      </label>
    </div>
  );
}

FloatField.displayName = "FloatField";

interface FloatSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

function FloatSelect({
  id,
  label,
  value,
  onChange,
  options,
}: FloatSelectProps) {
  const has = value.length > 0;
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="peer block w-full appearance-none rounded-lg border-zinc-200 bg-transparent px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-[#E11D74] focus:outline-none focus:ring-0"
      >
        <option value="" disabled hidden />
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute top-2 z-10 origin-[0] -translate-y-4 scale-75 bg-white px-2 text-sm text-[#E11D74]",
          has && "top-2 scale-75 -translate-y-4 text-[#E11D74]",
        )}
      >
        {label}
      </label>
    </div>
  );
}

FloatSelect.displayName = "FloatSelect";

interface FloatTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

function FloatTextarea({
  id,
  label,
  value,
  onChange,
  maxLength,
}: FloatTextareaProps) {
  const has = value.length > 0;
  return (
    <div className="relative">
      <textarea
        id={id}
        rows={4}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder=" "
        className="peer block w-full resize-none appearance-none rounded-lg border-zinc-200 bg-transparent px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-[#E11D74] focus:outline-none focus:ring-0"
      />
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute top-6 z-10 origin-[0] -translate-y-4 scale-100 bg-white px-2 text-sm text-zinc-500 transition-all duration-300",
          "peer-placeholder-shown:top-6 peer-placeholder-shown:translate-y-[-0%] peer-placeholder-shown:scale-100",
          "peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-[#E11D74]",
          has && "top-2 scale-75 -translate-y-4 text-[#E11D74]",
        )}
      >
        {label}
      </label>
    </div>
  );
}

FloatTextarea.displayName = "FloatTextarea";

function InfoCard({ settings }: { settings?: Settings | null }) {
  const address = settings?.address;
  const email = settings?.email;
  const phone = settings?.phone;
  const workingHours = settings?.working_hours;
  const companyName = settings?.company_name || "ML Cosmetics";

  const mapSearchUrl = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : undefined;

  return (
    <div className="flex flex-col gap-6 rounded-20px border border-rose-50 bg-white p-8 shadow-sm">
      <h3 className="border-b border-rose-50 pb-4 font-display text-xl font-semibold text-zinc-800">
        Thông tin liên hệ
      </h3>
      <InfoRow
        icon={<LocationOn size={20} />}
        title={companyName}
        body={
          address ? (
            <>
              <p className="text-sm leading-relaxed text-zinc-500">{address}</p>
              {mapSearchUrl && (
                <a
                  href={mapSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E11D74] mt-2 inline-flex items-center text-sm font-medium hover:underline"
                >
                  Xem bản đồ
                  <ArrowForward size={16} className="ml-1 text-[16px]" />
                </a>
              )}
            </>
          ) : (
            <p className="mt-1 text-sm italic text-zinc-400">Chưa cập nhật</p>
          )
        }
      />
      <InfoRow
        icon={<Mail size={20} />}
        title="Email"
        body={
          email ? (
            <a
              href={`mailto:${email}`}
              className="mt-1 text-sm text-zinc-500 transition-colors hover:text-[#E11D74]"
            >
              {email}
            </a>
          ) : (
            <p className="mt-1 text-sm italic text-zinc-400">Chưa cập nhật</p>
          )
        }
      />
      <InfoRow
        icon={<SupportAgent size={20} />}
        title="Hotline"
        body={
          phone ? (
            <a
              href={`tel:${phone}`}
              className="mt-1 text-sm font-medium text-zinc-700 transition-colors hover:text-[#E11D74]"
            >
              {phone}
            </a>
          ) : (
            <p className="mt-1 text-sm italic text-zinc-400">Chưa cập nhật</p>
          )
        }
      />
      <InfoRow
        icon={<Schedule size={20} />}
        title="Giờ CSKH"
        body={
          <p className="mt-1 text-sm text-zinc-500">
            {workingHours || "Chưa cập nhật"}
          </p>
        }
      />
    </div>
  );
}

InfoCard.displayName = "InfoCard";

interface InfoRowProps {
  icon: React.ReactNode;
  title: string;
  body: React.ReactNode;
}

function InfoRow({ icon, title, body }: InfoRowProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="shrink-0 rounded-full bg-rose-50 p-2 text-[#E11D74]">
        {icon}
      </div>
      <div>
        <p className="font-medium text-zinc-800">{title}</p>
        {body}
      </div>
    </div>
  );
}

InfoRow.displayName = "InfoRow";

const QUICK_LINKS = [
  { label: "Size vòng tay", href: "/faq" },
  { label: "Chính sách đổi trả", href: "/terms" },
  { label: "Thanh toán", href: "/faq" },
  { label: "Vận chuyển", href: "/terms" },
];

function FaqQuickLinksCard() {
  return (
    <div className="flex flex-col gap-3 rounded-20px border border-white bg-white/50 p-6 backdrop-blur-sm">
      <h4 className="font-display mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
        Hỗ trợ nhanh
      </h4>
      {QUICK_LINKS.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="group flex items-center justify-between rounded-lg border border-transparent bg-white p-3 transition-all hover:border-rose-100 hover:shadow-sm"
        >
          <span className="text-sm font-medium text-zinc-700 group-hover:text-[#E11D74]">
            {item.label}
          </span>
          <ArrowForward
            size={16}
            className="text-[#E11D74] text-sm transition-transform group-hover:translate-x-1"
          />
        </Link>
      ))}
    </div>
  );
}

FaqQuickLinksCard.displayName = "FaqQuickLinksCard";

/* ----------------------------------------------------------------------- *
 * Map section
 * ----------------------------------------------------------------------- */

function MapSection({ settings }: { settings?: Settings | null }) {
  const address = settings?.address;
  const companyName = settings?.company_name || "ML Cosmetics";
  const embedHtml = settings?.google_map_embed;

  // Extract iframe src if user supplied full HTML string `<iframe src="..." ...></iframe>`
  const extractedSrc = React.useMemo(() => {
    if (!embedHtml) return null;
    const match = embedHtml.match(/src=["']([^"']+)["']/i);
    return match ? match[1] : embedHtml.startsWith("http") ? embedHtml : null;
  }, [embedHtml]);

  const mapEmbedUrl =
    extractedSrc ||
    (address
      ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
      : undefined);

  const mapSearchUrl = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : "https://www.google.com/maps";

  if (!mapEmbedUrl && !address) {
    return null;
  }

  return (
    <section className="relative flex h-80 w-full items-center justify-center overflow-hidden rounded-20px border border-zinc-200 bg-zinc-100 shadow-sm">
      {mapEmbedUrl ? (
        <iframe
          title={`Bản đồ ${companyName}`}
          src={mapEmbedUrl}
          className="absolute inset-0 h-full w-full"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="absolute inset-0 bg-zinc-200" />
      )}
      <a
        href={mapSearchUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Mở bản đồ Google Maps ở tab mới"
        className="border-rose-50 relative z-10 flex items-center gap-3 rounded-xl border bg-white/90 p-4 shadow-lg backdrop-blur transition-transform hover:scale-[1.02]"
      >
        <span className="text-[#E11D74]">
          <LocationOn size={32} className="text-[#E11D74]" />
        </span>
        <div className="text-left">
          <p className="font-bold text-zinc-800">{companyName}</p>
          <p className="text-xs text-zinc-500">
            {address || "Chưa cập nhật địa chỉ"}
          </p>
          <p className="mt-1 text-xs font-medium text-[#E11D74]">
            Mở Google Maps ↗
          </p>
        </div>
      </a>
    </section>
  );
}

MapSection.displayName = "MapSection";

// Keep the unused import to prevent typecheck noUnusedLocals (used in InfoRow).
void CheckCircle;