"use client";

import * as React from "react";
import { formatDate } from "@/lib/utils";

/**
 * How to display a date range based on which bounds are set.
 */
export type DateRangeDisplay =
  | { type: "always" }
  | { type: "starts_only"; starts_at: string }
  | { type: "ends_only"; ends_at: string }
  | { type: "range"; starts_at: string; ends_at: string };

/**
 * `DateRangeText` — renders the scheduling period of a banner.
 *
 * Logic:
 *   Both null   → "Luôn hiển thị"
 *   starts only → "Từ dd/MM/yyyy"
 *   ends only   → "Đến dd/MM/yyyy"
 *   Both set    → "dd/MM → dd/MM/yyyy"
 */
export interface DateRangeTextProps {
  starts_at?: string | null;
  ends_at?: string | null;
  className?: string;
}

export function DateRangeText({
  starts_at,
  ends_at,
  className,
}: DateRangeTextProps) {
  const display = React.useMemo<DateRangeDisplay>(() => {
    const hasStart = starts_at && starts_at.trim().length > 0;
    const hasEnd = ends_at && ends_at.trim().length > 0;
    if (!hasStart && !hasEnd) return { type: "always" };
    if (hasStart && !hasEnd) return { type: "starts_only", starts_at: starts_at! };
    if (!hasStart && hasEnd) return { type: "ends_only", ends_at: ends_at! };
    return { type: "range", starts_at: starts_at!, ends_at: ends_at! };
  }, [starts_at, ends_at]);

  let text: string;
  switch (display.type) {
    case "always":
      text = "Luôn hiển thị";
      break;
    case "starts_only":
      text = `Từ ${formatDate(display.starts_at)}`;
      break;
    case "ends_only":
      text = `Đến ${formatDate(display.ends_at)}`;
      break;
    case "range":
      text = `${formatDate(display.starts_at)} → ${formatDate(display.ends_at)}`;
      break;
  }

  return (
    <span className={className}>
      {text}
    </span>
  );
}
