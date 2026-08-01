import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { CartStitchView } from "@/features/cart/components/cart-stitch-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Public Cart page (`/cart`).
 *
 * The page renders only the content area between the public shell
 * (top nav / marquee / footer / floating bubble) and the footer —
 * header / footer are owned by `PublicShell` and stay identical to
 * every other public page.
 *
 * Data is currently mock (see `CartStitchView`). When the cart
 * endpoint lands the view will swap to `useCart()` while the rest
 * of the page stays untouched.
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Giỏ hàng",
    description:
      "Giỏ hàng ML Cosmetics — hoàn tất đơn hàng Aura Rose của bạn với thanh toán an toàn và giao hàng toàn quốc.",
  };
}

export default function CartPage() {
  return (
    <Section tone="default" flush containerSize="xl">
      <Container size="xl" className="p-0">
        <CartStitchView />
      </Container>
    </Section>
  );
}