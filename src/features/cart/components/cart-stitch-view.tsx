"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Add,
  ArrowForward,
  AutoAwesome,
  Delete,
  Favorite,
  LocalShipping,
  Lock,
  Redeem,
  Remove,
  ShoppingBag,
} from "@/components/layout/storefront-icons";
import { Button } from "@/components/ui/button";
import { cn, formatVND, resolveImageUrl } from "@/lib/utils";

/**
 * CartStitchView — Stitch-aligned content area for `/cart`.
 *
 * Currently powered by mock data so the route is fully clickable
 * from the public TopNav even before the cart API lands. Layout
 * follows the canonical Stitch "Giỏ hàng - ML Cosmetics" pattern:
 *
 *   1. Header — Playfair italic headline + body + summary chips
 *      (item count / total weight / free-shipping progress).
 *   2. Items table — image + name + variant + price + quantity
 *      stepper + line total + remove.
 *   3. Coupon code input + "Tiếp tục mua sắm" link.
 *   4. Sticky right rail — order summary (subtotal / shipping /
 *      gift wrap / total), CTA "Thanh toán", trust badges
 *      (free shipping / genuine / warranty).
 *   5. Recommendation strip (3 mock products).
 *
 * The page is intentionally a server-friendly client component so
 * the cart context can later be lifted into a real `useCart` hook
 * without changing the layout. Header / footer / marquee / floating
 * bubble are owned by `PublicShell` and stay identical to every
 * other public page.
 */
export interface CartStitchViewProps {
  className?: string;
}

interface CartItem {
  id: string;
  slug: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  thumbnailUrl: string;
  giftBadge?: boolean;
}

const INITIAL_ITEMS: CartItem[] = [
  {
    id: "set-qua-vong-ngoc-dior",
    slug: "set-qua-vong-ngoc-dior",
    name: "Set Quà Vòng Ngọc & Dior",
    variant: "Vòng Ngọc Bích 18mm + Son Dior Addict Lip Glow",
    price: 8500000,
    quantity: 1,
    thumbnailUrl:
      "https://i.pinimg.com/1200x/86/09/e8/8609e800b9eef696a85a59d8aef83ce4.jpg",
    giftBadge: true,
  },
  {
    id: "vong-ngoc-bich-co-dien",
    slug: "vong-ngoc-bich-co-dien",
    name: "Vòng Ngọc Bích Cổ Điển",
    variant: "Ni 54-56 • Jadeite thiên nhiên",
    price: 4200000,
    quantity: 2,
    thumbnailUrl:
      "https://i.pinimg.com/1200x/30/6b/d2/306bd2eb4c2bdcbe6c0ac68ebb27700f.jpg",
  },
  {
    id: "day-chuyen-mat-ngoc-tron",
    slug: "day-chuyen-mat-ngoc-tron",
    name: "Dây Chuyền Mặt Ngọc Tròn",
    variant: "Dây vàng 18k • Mặt ngọc 8mm",
    price: 2800000,
    quantity: 1,
    thumbnailUrl:
      "https://i.pinimg.com/1200x/0f/3c/9d/0f3c9db4675351799c0435773765ca7f.jpg",
  },
];

interface RecommendedItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  thumbnailUrl: string;
}

const RECOMMENDED: RecommendedItem[] = [
  {
    id: "nhan-ngoc-bich-kim-tien",
    slug: "nhan-ngoc-bich-kim-tien",
    name: "Nhẫn Ngọc Bích Kim Tiền",
    price: 1500000,
    thumbnailUrl:
      "https://i.pinimg.com/1200x/a6/23/f2/a623f2891333ec842c7a3acfca8c1eed.jpg",
  },
  {
    id: "set-qua-tang-sang-trong",
    slug: "set-qua-tang-sang-trong",
    name: "Set Quà Tặng Sang Trọng",
    price: 15800000,
    thumbnailUrl:
      "https://i.pinimg.com/1200x/86/09/e8/8609e800b9eef696a85a59d8aef83ce4.jpg",
  },
  {
    id: "vong-ngoc-cam-thach-cao-cap",
    slug: "vong-ngoc-cam-thach-cao-cap",
    name: "Vòng Ngọc Cẩm Thạch Cao Cấp",
    price: 22000000,
    thumbnailUrl:
      "https://i.pinimg.com/1200x/d5/d1/d9/d5d1d97d5437945c01f4edbd8489f666.jpg",
  },
];

const SHIPPING_THRESHOLD = 5_000_000;
const SHIPPING_FEE = 30_000;
const GIFT_WRAP_FEE = 50_000;

export function CartStitchView({ className }: CartStitchViewProps) {
  const [items, setItems] = React.useState<CartItem[]>(INITIAL_ITEMS);
  const [coupon, setCoupon] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<string | null>(null);
  const [giftWrap, setGiftWrap] = React.useState(false);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const remainingForFreeShip = Math.max(SHIPPING_THRESHOLD - subtotal, 0);
  const freeShipProgress = Math.min(
    (subtotal / SHIPPING_THRESHOLD) * 100,
    100,
  );
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const giftWrapFee = giftWrap ? GIFT_WRAP_FEE : 0;
  const couponDiscount =
    appliedCoupon?.toUpperCase() === "AURA10"
      ? Math.round(subtotal * 0.1)
      : 0;
  const total = Math.max(
    subtotal + shipping + giftWrapFee - couponDiscount,
    0,
  );

  const updateQuantity = React.useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeItem = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleApplyCoupon = React.useCallback(() => {
    if (!coupon.trim()) return;
    setAppliedCoupon(coupon.trim());
  }, [coupon]);

  return (
    <div className={cn("flex flex-col", className)}>
      <CartHeader
        itemCount={itemCount}
        remainingForFreeShip={remainingForFreeShip}
        freeShipProgress={freeShipProgress}
      />

      <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <CartItems
              items={items}
              onUpdate={updateQuantity}
              onRemove={removeItem}
              coupon={coupon}
              setCoupon={setCoupon}
              appliedCoupon={appliedCoupon}
              onApplyCoupon={handleApplyCoupon}
              onClearCoupon={() => {
                setAppliedCoupon(null);
                setCoupon("");
              }}
            />
            <OrderSummary
              subtotal={subtotal}
              shipping={shipping}
              giftWrap={giftWrap}
              giftWrapFee={giftWrapFee}
              couponDiscount={couponDiscount}
              total={total}
              appliedCoupon={appliedCoupon}
              onToggleGiftWrap={() => setGiftWrap((prev) => !prev)}
            />
          </div>
        )}
      </section>

      <RecommendationStrip items={RECOMMENDED} />
    </div>
  );
}

CartStitchView.displayName = "CartStitchView";

/* ----------------------------------------------------------------------- *
 * Header
 * ----------------------------------------------------------------------- */

function CartHeader({
  itemCount,
  remainingForFreeShip,
  freeShipProgress,
}: {
  itemCount: number;
  remainingForFreeShip: number;
  freeShipProgress: number;
}) {
  return (
    <header className="mx-auto max-w-3xl px-4 pt-12 pb-8 text-center">
      <div className="mb-4 flex items-center justify-center gap-2">
        <span className="text-3xl text-[#E11D74]">
          <ShoppingBag size={32} className="text-3xl text-[#E11D74]" />
        </span>
        <span className="text-xl text-rose-300">
          <AutoAwesome size={22} className="text-xl text-rose-300" />
        </span>
      </div>
      <h1 className="font-headline mb-4 text-4xl font-semibold italic text-zinc-900 md:text-5xl">
        Giỏ hàng của bạn
      </h1>
      <p className="font-body mb-8 text-lg text-zinc-600">
        {itemCount > 0
          ? `${itemCount} sản phẩm đang chờ bạn hoàn tất đơn hàng.`
          : "Bạn chưa có sản phẩm nào trong giỏ."}
      </p>
      <div className="mx-auto max-w-xl rounded-full border border-rose-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm text-zinc-700">
          <span className="flex items-center gap-2 font-medium">
            <LocalShipping size={18} className="text-primary" />
            {remainingForFreeShip > 0
              ? `Mua thêm ${formatVND(remainingForFreeShip)} để được Freeship`
              : "Bạn đã được Freeship toàn quốc 🎉"}
          </span>
          <span className="font-semibold text-primary">
            {Math.round(freeShipProgress)}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-rose-100">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${freeShipProgress}%` }}
          />
        </div>
      </div>
    </header>
  );
}

CartHeader.displayName = "CartHeader";

/* ----------------------------------------------------------------------- *
 * Items + coupon
 * ----------------------------------------------------------------------- */

function CartItems({
  items,
  onUpdate,
  onRemove,
  coupon,
  setCoupon,
  appliedCoupon,
  onApplyCoupon,
  onClearCoupon,
}: {
  items: CartItem[];
  onUpdate: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  coupon: string;
  setCoupon: (value: string) => void;
  appliedCoupon: string | null;
  onApplyCoupon: () => void;
  onClearCoupon: () => void;
}) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <CartItemRow
          key={item.id}
          item={item}
          onUpdate={(delta) => onUpdate(item.id, delta)}
          onRemove={() => onRemove(item.id)}
        />
      ))}

      <div className="grid gap-3 rounded-[20px] border border-rose-100 bg-white p-5 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex flex-wrap items-center gap-3">
          <span className="material-symbols-outlined text-primary">redeem</span>
          <div className="flex-1 min-w-[180px]">
            <label
              htmlFor="cart-coupon"
              className="text-sm font-medium text-zinc-700"
            >
              Mã giảm giá
            </label>
            <input
              id="cart-coupon"
              type="text"
              value={coupon}
              onChange={(event) => setCoupon(event.target.value)}
              placeholder="Nhập mã (thử AURA10)"
              className="mt-1 w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        {appliedCoupon ? (
          <button
            type="button"
            onClick={onClearCoupon}
            className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-primary hover:bg-rose-100"
          >
            Hủy mã {appliedCoupon}
          </button>
        ) : (
          <Button
            onClick={onApplyCoupon}
            variant="outline"
            className="rounded-lg border-rose-200 px-4 py-2 text-sm font-medium text-primary hover:bg-rose-50"
          >
            Áp dụng
          </Button>
        )}
      </div>

      <Button
        asChild
        variant="ghost"
        className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-primary"
      >
        <Link href="/products">
          <span className="material-symbols-outlined text-base">
            arrow_back
          </span>
          Tiếp tục mua sắm
        </Link>
      </Button>
    </div>
  );
}

CartItems.displayName = "CartItems";

function CartItemRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: CartItem;
  onUpdate: (delta: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[20px] border border-rose-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
      <Link
        href={`/products/${item.slug}`}
        className="relative aspect-square h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-rose-50"
        aria-label={item.name}
      >
        {item.thumbnailUrl ? (
          <Image
            src={resolveImageUrl(item.thumbnailUrl)}
            alt={item.name}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : null}
        {item.giftBadge && (
          <span className="absolute top-2 left-2 flex items-center gap-1 rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
            <Redeem size={12} className="text-[12px]" />
            Quà tặng
          </span>
        )}
      </Link>
      <div className="flex-1 space-y-1">
        <Link
          href={`/products/${item.slug}`}
          className="font-headline text-lg font-semibold italic text-zinc-900 hover:text-primary"
        >
          {item.name}
        </Link>
        <p className="text-sm text-zinc-500">{item.variant}</p>
        <p className="text-sm font-medium text-primary">
          {formatVND(item.price)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-rose-200 bg-white text-sm font-semibold text-zinc-700">
          <button
            type="button"
            aria-label="Giảm số lượng"
            onClick={() => onUpdate(-1)}
            className="grid h-9 w-9 place-items-center rounded-l-full hover:bg-rose-50"
          >
            <Remove size={16} />
          </button>
          <span className="w-8 text-center">{item.quantity}</span>
          <button
            type="button"
            aria-label="Tăng số lượng"
            onClick={() => onUpdate(1)}
            className="grid h-9 w-9 place-items-center rounded-r-full hover:bg-rose-50"
          >
            <Add size={16} />
          </button>
        </div>
        <p className="w-32 text-right text-sm font-semibold text-zinc-900">
          {formatVND(item.price * item.quantity)}
        </p>
        <button
          type="button"
          aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
          onClick={onRemove}
          className="grid h-9 w-9 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-rose-50 hover:text-red-500"
        >
          <Delete size={18} />
        </button>
      </div>
    </div>
  );
}

CartItemRow.displayName = "CartItemRow";

/* ----------------------------------------------------------------------- *
 * Order summary (sticky)
 * ----------------------------------------------------------------------- */

function OrderSummary({
  subtotal,
  shipping,
  giftWrap,
  giftWrapFee,
  couponDiscount,
  total,
  appliedCoupon,
  onToggleGiftWrap,
}: {
  subtotal: number;
  shipping: number;
  giftWrap: boolean;
  giftWrapFee: number;
  couponDiscount: number;
  total: number;
  appliedCoupon: string | null;
  onToggleGiftWrap: () => void;
}) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-28 lg:h-fit">
      <div className="rounded-[20px] border border-rose-100 bg-white p-6 shadow-sm">
        <h2 className="font-headline mb-4 text-xl font-semibold italic text-zinc-900">
          Tóm tắt đơn hàng
        </h2>
        <SummaryRow label="Tạm tính" value={formatVND(subtotal)} />
        <SummaryRow
          label="Vận chuyển"
          value={shipping === 0 ? "Miễn phí" : formatVND(shipping)}
          valueClass={shipping === 0 ? "text-emerald-600" : undefined}
        />
        <label className="mt-3 flex cursor-pointer items-center justify-between rounded-xl border border-rose-100 bg-rose-50/40 p-3">
          <span className="flex items-center gap-2 text-sm text-zinc-700">
            <span className="material-symbols-outlined text-primary">
              redeem
            </span>
            <span>
              <span className="font-medium">Hộp quà sang trọng</span>
              <span className="block text-xs text-zinc-500">
                Đóng gói quà + thiệp viết tay
              </span>
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-700">
              {giftWrap ? formatVND(giftWrapFee) : formatVND(0)}
            </span>
            <input
              type="checkbox"
              checked={giftWrap}
              onChange={onToggleGiftWrap}
              className="h-4 w-4 rounded border-rose-300 text-primary focus:ring-primary"
            />
          </span>
        </label>
        {couponDiscount > 0 && (
          <SummaryRow
            label={`Mã giảm giá ${appliedCoupon ?? ""}`}
            value={`-${formatVND(couponDiscount)}`}
            valueClass="text-emerald-600"
          />
        )}
        <div className="my-4 h-px w-full bg-rose-100" />
        <div className="flex items-baseline justify-between">
          <span className="text-base font-semibold text-zinc-900">
            Tổng cộng
          </span>
          <span className="text-2xl font-bold text-primary">
            {formatVND(total)}
          </span>
        </div>
        <Button
          asChild
          className="mt-5 w-full rounded-btn bg-primary py-3.5 font-semibold text-white hover:bg-primary/90"
        >
          <Link href="/contact">
            <Lock size={18} className="mr-2" />
            Thanh toán an toàn
            <ArrowForward size={16} className="ml-2" />
          </Link>
        </Button>
        <p className="mt-3 text-center text-xs text-zinc-500">
          Bằng cách thanh toán, bạn đồng ý với{" "}
          <Link href="/terms" className="text-primary underline">
            điều khoản dịch vụ
          </Link>{" "}
          của ML Cosmetics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <TrustBadge
          icon={<LocalShipping size={20} className="text-primary" />}
          title="Freeship"
          body="Đơn từ 5 triệu"
        />
        <TrustBadge
          icon={<Redeem size={20} className="text-primary" />}
          title="Chính hãng"
          body="GRA quốc tế"
        />
        <TrustBadge
          icon={<Favorite size={20} className="text-primary" filled />}
          title="Bảo hành"
          body="Trọn đời"
        />
      </div>
    </aside>
  );
}

OrderSummary.displayName = "OrderSummary";

function SummaryRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-baseline justify-between py-1.5 text-sm">
      <span className="text-zinc-600">{label}</span>
      <span className={cn("font-semibold text-zinc-900", valueClass)}>
        {value}
      </span>
    </div>
  );
}

SummaryRow.displayName = "SummaryRow";

function TrustBadge({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-3 text-center shadow-sm">
      <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-rose-50">
        {icon}
      </div>
      <p className="text-xs font-semibold text-zinc-800">{title}</p>
      <p className="text-[11px] text-zinc-500">{body}</p>
    </div>
  );
}

TrustBadge.displayName = "TrustBadge";

/* ----------------------------------------------------------------------- *
 * Empty state
 * ----------------------------------------------------------------------- */

function EmptyCart() {
  return (
    <div className="mx-auto max-w-xl rounded-[20px] border border-rose-100 bg-white p-12 text-center shadow-sm">
      <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-primary">
        <ShoppingBag size={36} />
      </span>
      <h2 className="font-headline mb-2 text-2xl italic text-zinc-900">
        Giỏ hàng của bạn đang trống
      </h2>
      <p className="mb-6 text-zinc-600">
        Khám phá các bộ sưu tập Aura Rose và lựa chọn cho mình những món
        quà tinh tế nhất.
      </p>
      <Button
        asChild
        className="rounded-btn bg-primary px-6 py-3 font-medium text-white hover:bg-primary/90"
      >
        <Link href="/products">
          Khám phá bộ sưu tập
          <ArrowForward size={16} className="ml-2" />
        </Link>
      </Button>
    </div>
  );
}

EmptyCart.displayName = "EmptyCart";

/* ----------------------------------------------------------------------- *
 * Recommendation strip
 * ----------------------------------------------------------------------- */

function RecommendationStrip({ items }: { items: RecommendedItem[] }) {
  return (
    <section className="border-t border-rose-100 bg-rose-50/40 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-headline text-2xl italic text-zinc-900">
            Có thể bạn cũng sẽ thích
          </h2>
          <Button
            asChild
            variant="ghost"
            className="text-sm font-medium text-primary hover:bg-rose-50"
          >
            <Link href="/products">
              Xem tất cả
              <ArrowForward size={14} className="ml-1" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <RecommendedCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

RecommendationStrip.displayName = "RecommendationStrip";

function RecommendedCard({ item }: { item: RecommendedItem }) {
  return (
    <Link
      href={`/products/${item.slug}`}
      className="group flex gap-4 rounded-[20px] border border-rose-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-rose-50">
        {item.thumbnailUrl ? (
          <Image
            src={resolveImageUrl(item.thumbnailUrl)}
            alt={item.name}
            fill
            sizes="96px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col justify-center">
        <h3 className="font-headline line-clamp-1 text-base font-semibold italic text-zinc-900">
          {item.name}
        </h3>
        <p className="mt-1 text-sm font-semibold text-primary">
          {formatVND(item.price)}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Thêm vào giỏ chỉ với 1 chạm
        </p>
      </div>
    </Link>
  );
}

RecommendedCard.displayName = "RecommendedCard";