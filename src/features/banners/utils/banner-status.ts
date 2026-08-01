import type { Banner } from "@/types";

/**
 * Operational lifecycle of a banner. Derived from `is_active` plus the
 * optional scheduling window (`starts_at` / `ends_at`). The four
 * states are mutually exclusive and match what the storefront uses
 * to decide which banners to render:
 *
 *   - `Active`    — is_active=true AND inside the schedule window
 *                  (or no schedule set). Currently shown to shoppers.
 *   - `Scheduled` — is_active=true but `starts_at` is still in the
 *                  future. Will turn active automatically.
 *   - `Expired`   — `ends_at` is in the past. No longer rendered,
 *                  regardless of `is_active`.
 *   - `Inactive`  — is_active=false and not otherwise scheduled/
 *                  expired. Operator has switched it off.
 *
 * `Expired` wins over `Inactive` so the operator can still see why
 * a banner disappeared from the storefront without opening it.
 */
export type BannerLifecycle = "active" | "scheduled" | "expired" | "inactive";

export interface BannerStatusInfo {
  lifecycle: BannerLifecycle;
  /** Vietnamese label shown in the card badge. */
  label: string;
  /** Short tooltip / aria-label. */
  description: string;
}

export const BANNER_STATUS_LABELS: Record<BannerLifecycle, string> = {
  active: "Đang hiển thị",
  scheduled: "Đã lên lịch",
  expired: "Đã hết hạn",
  inactive: "Đã tắt",
};

export const BANNER_STATUS_DESCRIPTIONS: Record<BannerLifecycle, string> = {
  active: "Banner đang được hiển thị trên trang chủ.",
  scheduled: "Banner sẽ tự động bật khi đến thời gian bắt đầu.",
  expired: "Banner đã hết thời gian hiển thị theo lịch.",
  inactive: "Banner đang bị tắt thủ công.",
};

const toEpoch = (iso: string | null | undefined): number | null => {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
};

/**
 * Compute the operational status of a banner. Pure: takes a `Date`
 * reference so it stays testable and SSR-safe. The caller passes
 * `new Date()` from the client.
 */
export function getBannerStatus(banner: Banner, now: Date = new Date()): BannerStatusInfo {
  const nowMs = now.getTime();
  const startMs = toEpoch(banner.starts_at);
  const endMs = toEpoch(banner.ends_at);

  if (endMs !== null && endMs <= nowMs) {
    return {
      lifecycle: "expired",
      label: BANNER_STATUS_LABELS.expired,
      description: BANNER_STATUS_DESCRIPTIONS.expired,
    };
  }

  if (banner.is_active) {
    if (startMs !== null && startMs > nowMs) {
      return {
        lifecycle: "scheduled",
        label: BANNER_STATUS_LABELS.scheduled,
        description: BANNER_STATUS_DESCRIPTIONS.scheduled,
      };
    }
    return {
      lifecycle: "active",
      label: BANNER_STATUS_LABELS.active,
      description: BANNER_STATUS_DESCRIPTIONS.active,
    };
  }

  return {
    lifecycle: "inactive",
    label: BANNER_STATUS_LABELS.inactive,
    description: BANNER_STATUS_DESCRIPTIONS.inactive,
  };
}

/**
 * Filter keys surfaced as tabs in the admin list. `all` matches every
 * banner regardless of lifecycle.
 */
export type BannerStatusFilter = BannerLifecycle | "all";

export const BANNER_STATUS_FILTERS: ReadonlyArray<{
  value: BannerStatusFilter;
  label: string;
}> = [
  { value: "all", label: "Tất cả" },
  { value: "active", label: "Đang hiển thị" },
  { value: "scheduled", label: "Đã lên lịch" },
  { value: "expired", label: "Đã hết hạn" },
  { value: "inactive", label: "Đã tắt" },
];