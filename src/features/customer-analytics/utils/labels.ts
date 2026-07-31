import type { AnalyticsChannel, AnalyticsTab } from "@/types";

/**
 * Vietnamese label for each analytics channel. Used in the channel
 * share breakdown card.
 */
export function getChannelLabel(channel: AnalyticsChannel): string {
  switch (channel) {
    case "website":
      return "Website";
    case "facebook":
      return "Facebook";
    case "zalo":
      return "Zalo";
    case "instagram":
      return "Instagram";
    case "tiktok":
      return "TikTok";
    case "other":
    default:
      return "Khác";
  }
}

/**
 * Tailwind classes for the channel share bar / pill. Matches the
 * dark LuxeOps palette.
 */
export function getChannelChipClass(channel: AnalyticsChannel): string {
  switch (channel) {
    case "website":
      return "bg-[#e11d74]";
    case "facebook":
      return "bg-blue-500";
    case "zalo":
      return "bg-emerald-500";
    case "instagram":
      return "bg-pink-500";
    case "tiktok":
      return "bg-rose-500";
    case "other":
    default:
      return "bg-[#71717a]";
  }
}

/**
 * Vietnamese label for each analytics tab.
 */
export function getTabLabel(tab: AnalyticsTab): string {
  switch (tab) {
    case "overview":
      return "Tổng quan";
    case "traffic":
      return "Lưu lượng";
    case "behaviour":
      return "Hành vi";
    case "channels":
      return "Kênh liên hệ";
    case "products":
      return "Sản phẩm";
    default:
      return tab;
  }
}
