"use client";

import * as React from "react";
import {
  AssignmentReturn,
  CheckCircle,
  Gavel,
  ShoppingCartCheckout,
  ShieldLocked,
  Security,
  Verified,
  LocalShipping,
} from "@/components/layout/storefront-icons";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

/**
 * TermsView — sticky-tab editorial layout for the storefront
 * Terms of Service page.
 *
 * Two variants:
 *   - `classic` (default): vertical tab strip + paragraphs article.
 *     Matches the original Aura Vénus spec.
 *   - `policies` (Stitch): rounded pill nav with Material Symbols
 *     icons, editorial hero with `shield_locked` glyph, sections
 *     with bg watermarks + `check_circle` lists, gradient CTA strip
 *     with Messenger/Zalo/Hotline buttons, and a floating concierge
 *     FAB. Matches the Stitch HTML `Chính sách & Điều khoản`.
 *
 * Clicking a tab scrolls the matching section into view (smooth) and
 * a scroll-spy observer keeps the active tab in sync.
 */
export interface TermsSection {
  id: string;
  title: string;
  summary?: string;
  paragraphs: string[];
  /** Optional Material Symbols glyph for the `policies` variant. */
  icon?: string;
  /** Bullet items rendered as `check_circle` rows under the body. */
  bullets?: string[];
}

export interface TermsViewProps {
  intro: { title: string; body: string[] };
  sections: TermsSection[];
  /** Visual variant. Defaults to the editorial `classic` look. */
  variant?: "classic" | "policies";
  /** Last updated label, only used by the `policies` hero. */
  lastUpdated?: string;
  className?: string;
}

export function TermsView({
  intro,
  sections,
  variant = "classic",
  lastUpdated,
  className,
}: TermsViewProps) {
  return variant === "policies" ? (
    <PoliciesLayout
      intro={intro}
      sections={sections}
      lastUpdated={lastUpdated}
      className={className}
    />
  ) : (
    <ClassicLayout intro={intro} sections={sections} className={className} />
  );
}

TermsView.displayName = "TermsView";

/* ----------------------------------------------------------------------- *
 * Classic layout (Aura Vénus editorial)
 * ----------------------------------------------------------------------- */

function ClassicLayout({ intro, sections, className }: TermsViewProps) {
  const [activeId, setActiveId] = React.useState<string>(sections[0]?.id ?? "");
  const sectionRefs = React.useRef(new Map<string, HTMLDivElement>());

  React.useEffect(() => {
    if (!activeId && sections[0]) {
      setActiveId(sections[0].id);
    }
  }, [activeId, sections]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const id = (visible.target as HTMLElement).dataset.termsSection;
          if (id) setActiveId(id);
        }
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0.05, 0.3, 0.6] },
    );

    sectionRefs.current.forEach((el, id) => {
      el.dataset.termsSection = id;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const handleSelect = React.useCallback((id: string) => {
    const el = sectionRefs.current.get(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  }, []);

  const handleScrollTop = React.useCallback(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  return (
    <div className={cn("grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]", className)}>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <nav
          aria-label="Mục lục điều khoản"
          className="rounded-xl border border-hairline bg-card p-3 shadow-sm"
        >
          <p className="px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.05em] text-primary">
            Mục lục
          </p>
          <ul className="mt-1 space-y-1">
            {sections.map((section) => {
              const isActive = section.id === activeId;
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(section.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "block w-full rounded-lg px-3 py-2 text-left text-[14px] font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-accent",
                    )}
                  >
                    {section.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <article className="space-y-10">
        <header className="rounded-xl border border-hairline bg-card p-6 md:p-10 shadow-sm">
          <h2 className="text-[24px] font-semibold leading-[1.3] text-foreground md:text-[28px]">
            {intro.title}
          </h2>
          <div className="mt-4 space-y-4">
            {intro.body.map((paragraph, idx) => (
              <p
                key={idx}
                className="text-[15px] leading-[1.7] text-foreground"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </header>

        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            ref={(el: HTMLDivElement | null) => {
              if (el) sectionRefs.current.set(section.id, el);
              else sectionRefs.current.delete(section.id);
            }}
            className="rounded-xl border border-hairline bg-card p-6 md:p-10 shadow-sm"
          >
            <h2 className="text-[22px] font-semibold leading-[1.3] text-foreground md:text-[26px]">
              {section.title}
            </h2>
            {section.summary && (
              <p className="mt-3 text-[15px] leading-[1.7] text-muted-foreground">
                {section.summary}
              </p>
            )}
            <div className="mt-5 space-y-4">
              {section.paragraphs.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-[15px] leading-[1.7] text-foreground"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}

        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={handleScrollTop}>
            Quay lại đầu trang
          </Button>
        </div>
      </article>
    </div>
  );
}

/* ----------------------------------------------------------------------- *
 * Stitch variant — Chính sách & Điều khoản
 * ----------------------------------------------------------------------- */

const POLICY_ICON_REGISTRY: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  shield_locked: ShieldLocked,
  verified: Verified,
  assignment_return: AssignmentReturn,
  local_shipping: LocalShipping,
  security: Security,
  gavel: Gavel,
  shopping_cart_checkout: ShoppingCartCheckout,
};

function resolvePolicyIcon(icon?: string) {
  if (!icon) return ShieldLocked;
  return POLICY_ICON_REGISTRY[icon] ?? ShieldLocked;
}

function PoliciesLayout({
  intro,
  sections,
  lastUpdated,
  className,
}: TermsViewProps) {
  const [activeId, setActiveId] = React.useState<string>(sections[0]?.id ?? "");
  const sectionRefs = React.useRef(new Map<string, HTMLDivElement>());

  React.useEffect(() => {
    if (!activeId && sections[0]) {
      setActiveId(sections[0].id);
    }
  }, [activeId, sections]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const id = (visible.target as HTMLElement).dataset.termsSection;
          if (id) setActiveId(id);
        }
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0.05, 0.3, 0.6] },
    );

    sectionRefs.current.forEach((el, id) => {
      el.dataset.termsSection = id;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const handleSelect = React.useCallback((id: string) => {
    const el = sectionRefs.current.get(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  }, []);

  return (
    <div className={cn("space-y-16", className)}>
      {/* =========================== EDITORIAL HERO =========================== */}
      <header className="relative mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
        <span className="material-symbols-outlined filled absolute left-1/4 top-10 animate-pulse text-3xl text-rose-300 opacity-50">
          spark
        </span>
        <span className="material-symbols-outlined filled absolute bottom-10 right-1/4 animate-pulse text-2xl text-rose-300 opacity-50 [animation-delay:150ms]">
          spark
        </span>
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full border border-rose-100 bg-rose-100/50 text-primary shadow-sm">
          <ShieldLocked size={32} />
        </div>
        <h1 className="font-playfair mb-6 italic text-zinc-900 text-4xl md:text-5xl tracking-tight">
          Chính sách &amp; Điều khoản
        </h1>
        <p className="font-body mx-auto mb-4 max-w-2xl text-lg text-zinc-600 md:text-xl">
          Sự minh bạch là nền tảng của mọi mối quan hệ ML Cosmetics xây dựng.
        </p>
        {lastUpdated && (
          <p className="font-label text-sm text-zinc-400">
            Cập nhật lần cuối: {lastUpdated}
          </p>
        )}
        {intro.body.length > 0 && (
          <p className="font-body mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-600">
            {intro.body[0]}
          </p>
        )}
      </header>

      {/* =========================== 2-COL BODY =========================== */}
      <main className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 pb-24 md:grid-cols-12">
        {/* LEFT — sticky nav */}
        <aside className="relative md:col-span-4 lg:col-span-3">
          <div className="sticky top-28 rounded-xl border border-rose-50 bg-white p-6 shadow-sm">
            <nav className="flex flex-col space-y-2 font-body text-sm">
              {sections.map((section) => {
                const isActive = section.id === activeId;
                const Icon = resolvePolicyIcon(section.icon);
                return (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={(event) => {
                      event.preventDefault();
                      handleSelect(section.id);
                    }}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "nav-item group flex items-center space-x-3 rounded-full px-4 py-3 transition-all",
                      isActive
                        ? "bg-primary text-white"
                        : "text-zinc-600 hover:bg-rose-50 hover:text-primary",
                    )}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{section.title}</span>
                  </a>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* RIGHT — section cards */}
        <div className="space-y-12 md:col-span-8 lg:col-span-9">
          {sections.map((section) => {
            const Icon = resolvePolicyIcon(section.icon);
            return (
              <section
                key={section.id}
                id={section.id}
                ref={(el: HTMLDivElement | null) => {
                  if (el) sectionRefs.current.set(section.id, el);
                  else sectionRefs.current.delete(section.id);
                }}
                className="group relative scroll-mt-28 overflow-hidden rounded-[20px] border border-rose-50 bg-white p-8 shadow-sm"
              >
                <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                  <Icon size={80} className="filled text-primary" />
                </div>
                <div className="relative z-10">
                  <div className="mb-6 flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-primary">
                      <Icon size={24} />
                    </div>
                    <h3 className="font-playfair text-2xl font-semibold italic text-zinc-900">
                      {section.title}
                    </h3>
                  </div>
                  {section.summary && (
                    <p className="font-body mb-4 leading-relaxed text-zinc-600">
                      {section.summary}
                    </p>
                  )}
                  {section.paragraphs.length > 0 && (
                    <div className="font-body mb-4 space-y-3 text-zinc-600">
                      {section.paragraphs.map((paragraph, idx) => (
                        <p key={idx} className="leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  )}
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="font-body space-y-3 text-zinc-600">
                      {section.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle
                            size={16}
                            className="mt-1 mr-2 text-primary"
                          />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            );
          })}

          {sections.length === 0 && (
            <div className="rounded-[20px] border border-rose-50 bg-white p-8 text-center">
              <h3 className="font-playfair text-2xl italic text-zinc-900">
                {intro.title}
              </h3>
              <p className="font-body mt-3 text-zinc-600">
                Nội dung chính sách đang được cập nhật. Vui lòng quay lại sau hoặc
                liên hệ trực tiếp với đội ngũ ML Cosmetics.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}