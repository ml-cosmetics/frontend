import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind-aware class concatenator. Combines `clsx` (conditional) and
 * `tailwind-merge` (deduplicates conflicting utilities) so callers can
 * safely pass arrays / conditional objects without producing duplicate
 * tailwind classes.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
