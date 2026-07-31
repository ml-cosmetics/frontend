"use client";

import { Toaster } from "sonner";

/**
 * Toast viewport. Mounted once at the root so the rest of the app
 * can call `toast.success(...)` from anywhere (mutations, error
 * interceptors, etc.) without re-rendering on every notification.
 *
 * `richColors` lights up success / error / warning with semantic
 * colours. `closeButton` keeps the dismiss affordance visible.
 *
 * Position + offset:
 * `position="top-right"` pins the stack to the top-right corner.
 * `offset="88px"` clears the storefront top nav (which sits as a
 * fixed/sticky bar at the top of the viewport) so a wishlist-add
 * toast never lands on top of the search / wishlist / cart
 * icons. The exact number matches the navbar's desktop height
 * (logo + actions on a single row, ~80 px) plus a little breathing
 * room so the toast reads as floating below the bar rather than
 * clipped against it.
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      offset="88px"
      toastOptions={{
        duration: 4000,
      }}
    />
  );
}
