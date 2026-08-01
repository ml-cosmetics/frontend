/**
 * Domain types for the storefront wishlist.
 *
 * The wishlist is purely client-side for now (no backend endpoint
 * yet — see HANDOFF.md "Backend limitations"). Items are mirrored
 * to `localStorage` so the page survives reloads. The shape is
 * built to be 1:1 with `ProductListItem` so a future server-side
 * wishlist endpoint can drop in without refactoring the UI.
 */
export interface WishlistItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAt?: number | null;
  thumbnailUrl: string;
  addedAt: string;
}