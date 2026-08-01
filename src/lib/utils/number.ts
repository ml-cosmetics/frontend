/**
 * Locale-aware number formatter (Vietnamese, no currency).
 *
 * Use for plain integer counts (KPIs, sold quantities, stock). For
 * currency-formatted output use {@link formatVND} instead.
 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n);
}