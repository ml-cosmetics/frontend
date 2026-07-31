"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { TopNav } from "./top-nav";
import { AnnouncementMarquee } from "./announcement-marquee";
import { PublicFooter } from "./public-footer";
import { FloatingActionBubble } from "./floating-action-bubble";
import { ForceLightTheme } from "./force-light-theme";
import type { APIError } from "@/lib/api";
import { settingsApi } from "@/lib/api";
import { queryKeys } from "@/lib/query";
import type { Settings } from "@/types";

/**
 * Public storefront shell — single source of truth for the Aura Rose
 * Luxury Treatment (Stitch) header / marquee / footer / floating
 * bubble.
 *
 * Every route inside the `(public)` route group renders inside this
 * shell. The header, marquee announcement strip, footer, and floating
 * action bubble are imported from dedicated shared components so they
 * stay byte-for-byte identical with the Stitch reference without
 * per-page duplication.
 *
 * The shell remains a client component because:
 *   - the mobile menu uses a small amount of state (lives in TopNav),
 *   - the brand wordmark can read from `GET /v1/settings` so it
 *     reflects the active brand record without redeploy.
 *
 * `ForceLightTheme` mirrors the admin behaviour: the storefront is
 * always light, never inherits the optional dark-mode toggle from
 * other surfaces.
 */
export interface PublicShellProps {
  children: React.ReactNode;
  initialSettings?: Settings;
  /** When true (default), render the announcement marquee under the
   *  top nav. Set false on routes where the marquee would compete
   *  with a hero (rare; the homepage uses the marquee). */
  showMarquee?: boolean;
}

export function PublicShell({
  children,
  initialSettings,
  showMarquee = true,
}: PublicShellProps) {
  const settingsQuery = useQuery<Settings, APIError>({
    queryKey: queryKeys.settings.singleton(),
    queryFn: () => settingsApi.get(),
    initialData: initialSettings,
  });

  const brandLabel = settingsQuery.data?.company_name?.trim() || "ML Cosmetics";

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#FFF1F7] to-[#FCE7F3] text-zinc-800">
      <ForceLightTheme />

      <TopNav brandLabel={brandLabel} />

      {showMarquee && <AnnouncementMarquee />}

      <main className="flex-1">{children}</main>

      <PublicFooter brandLabel={brandLabel} />

      <FloatingActionBubble />
    </div>
  );
}