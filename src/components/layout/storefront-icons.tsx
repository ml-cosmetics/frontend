import * as React from "react";

/**
 * Storefront icon set (Material Symbols Outlined).
 *
 * The Aura Rose Luxury Treatment (Stitch public surface) renders icons
 * via Material Symbols Outlined (`<span class="material-symbols-outlined">
 * name</span>`). These thin React wrappers keep JSX consistent across
 * the public shell — header, hero, marquee, footer, floating bubble,
 * best-seller grid, etc. — without dragging in a separate icon library.
 */

export interface StorefrontIconProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: number;
}

export function StorefrontIcon({
  name,
  size = 24,
  className,
  ...rest
}: StorefrontIconProps) {
  // Render via a Material Symbols glyph so the typography stays in
  // sync with the rest of the storefront. Inline style controls the
  // glyph size because Material Symbols inherits from font-size.
  return (
    <span
      aria-hidden
      className={className}
      style={{ fontSize: size, lineHeight: 1, display: "inline-block" }}
      {...rest}
    >
      <span className="material-symbols-outlined">{name}</span>
    </span>
  );
}

export function Search(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="search" {...props} />;
}

export function Favorite(props: {
  size?: number;
  className?: string;
  filled?: boolean;
}) {
  const { filled, className, ...rest } = props;
  return (
    <StorefrontIcon
      name="favorite"
      {...rest}
      className={[
        className ?? "",
        filled ? "[font-variation-settings:'FILL'_1,'wght'_400]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

export function Person(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="person" {...props} />;
}

export function Mail(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="mail" {...props} />;
}

export function LocationOn(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="location_on" {...props} />;
}

export function Schedule(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="schedule" {...props} />;
}

export function Shield(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="shield" {...props} />;
}

export function Groups(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="groups" {...props} />;
}

export function FormatQuote(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="format_quote" {...props} />;
}

export function Store(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="store" {...props} />;
}

export function ShoppingCart(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="shopping_cart" {...props} />;
}

export function ShoppingBag(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="shopping_bag" {...props} />;
}

export function ArrowForward(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="arrow_forward" {...props} />;
}

export function East(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="east" {...props} />;
}

export function AutoAwesome(props: {
  size?: number;
  className?: string;
  filled?: boolean;
  style?: React.CSSProperties;
}) {
  const { filled, className, style, ...rest } = props;
  return (
    <StorefrontIcon
      name="auto_awesome"
      {...rest}
      style={style}
      className={[
        className ?? "",
        filled ? "[font-variation-settings:'FILL'_1,'wght'_400]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

export function Verified(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="verified" {...props} />;
}

export function SupportAgent(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="support_agent" {...props} />;
}

export function LocalShipping(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="local_shipping" {...props} />;
}

export function PublishedWithChanges(props: {
  size?: number;
  className?: string;
}) {
  return <StorefrontIcon name="published_with_changes" {...props} />;
}

export function Chat(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="chat" {...props} />;
}

export function ContactSupport(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="contact_support" {...props} />;
}

export function PhotoCamera(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="photo_camera" {...props} />;
}

export function Menu(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="menu" {...props} />;
}

export function Close(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="close" {...props} />;
}

export function ChevronRight(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="chevron_right" {...props} />;
}

export function ChevronLeft(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="chevron_left" {...props} />;
}

export function KeyboardArrowDown(props: {
  size?: number;
  className?: string;
}) {
  return <StorefrontIcon name="keyboard_arrow_down" {...props} />;
}

export function GridView(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="grid_view" {...props} />;
}

export function ViewList(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="view_list" {...props} />;
}

export function Diamond(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="diamond" {...props} />;
}

export function ShoppingCartCheckout(props: {
  size?: number;
  className?: string;
}) {
  return <StorefrontIcon name="shopping_cart_checkout" {...props} />;
}

export function Star(props: {
  size?: number;
  className?: string;
  filled?: boolean;
}) {
  const { filled, className, ...rest } = props;
  return (
    <StorefrontIcon
      name="star"
      {...rest}
      className={[
        className ?? "",
        filled ? "[font-variation-settings:'FILL'_1,'wght'_400]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

export function FeaturedSeasonalAndGifts(props: {
  size?: number;
  className?: string;
  filled?: boolean;
}) {
  const { filled, className, ...rest } = props;
  return (
    <StorefrontIcon
      name="featured_seasonal_and_gifts"
      {...rest}
      className={[
        className ?? "",
        filled ? "[font-variation-settings:'FILL'_1,'wght'_400]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

export function Bolt(props: {
  size?: number;
  className?: string;
  filled?: boolean;
}) {
  const { filled, className, ...rest } = props;
  return (
    <StorefrontIcon
      name="bolt"
      {...rest}
      className={[
        className ?? "",
        filled ? "[font-variation-settings:'FILL'_1,'wght'_400]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

export function Visibility(props: {
  size?: number;
  className?: string;
  filled?: boolean;
}) {
  const { filled, className, ...rest } = props;
  return (
    <StorefrontIcon
      name="visibility"
      {...rest}
      className={[
        className ?? "",
        filled ? "[font-variation-settings:'FILL'_1,'wght'_400]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

export function PlayCircle(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="play_circle" {...props} />;
}

export function StarHalf(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="star_half" {...props} />;
}

export function Stars(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="stars" {...props} />;
}

export function ShieldLocked(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="shield_locked" {...props} />;
}

export function Spark(props: {
  size?: number;
  className?: string;
  filled?: boolean;
}) {
  const { filled, className, ...rest } = props;
  return (
    <StorefrontIcon
      name="spark"
      {...rest}
      className={[
        className ?? "",
        filled ? "[font-variation-settings:'FILL'_1,'wght'_400]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

export function Flare(props: {
  size?: number;
  className?: string;
  filled?: boolean;
}) {
  const { filled, className, ...rest } = props;
  return (
    <StorefrontIcon
      name="flare"
      {...rest}
      className={[
        className ?? "",
        filled ? "[font-variation-settings:'FILL'_1,'wght'_400]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

export function CheckCircle(props: {
  size?: number;
  className?: string;
  filled?: boolean;
}) {
  const { filled, className, ...rest } = props;
  return (
    <StorefrontIcon
      name="check_circle"
      {...rest}
      className={[
        className ?? "",
        filled ? "[font-variation-settings:'FILL'_1,'wght'_400]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

export function AssignmentReturn(props: {
  size?: number;
  className?: string;
}) {
  return <StorefrontIcon name="assignment_return" {...props} />;
}

export function Security(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="security" {...props} />;
}

export function Gavel(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="gavel" {...props} />;
}

export function Mic(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="mic" {...props} />;
}

export function Help(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="help" {...props} />;
}

export function ExpandMore(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="expand_more" {...props} />;
}

export function Call(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="call" {...props} />;
}

export function Forum(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="forum" {...props} />;
}

export function Facebook(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="share" {...props} />;
}

/**
 * Facebook brand glyph (f logo in rounded square).
 *
 * Material Symbols doesn't ship brand logos, so this renders an inline
 * SVG that mirrors the official Facebook lockup. Use it whenever a tile
 * needs to clearly read as "Facebook" rather than a generic share icon.
 */
export function FacebookBrand(props: {
  size?: number;
  className?: string;
}) {
  const { size = 24, className } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
      className={className}
    >
      <path
        fill="currentColor"
        d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.43-4.92 8.43-9.94Z"
      />
    </svg>
  );
}

/**
 * Zalo brand glyph — speech bubble with a stylised "Z".
 *
 * Zalo is a Vietnamese messenger, no Material Symbols equivalent, so we
 * inline the official wordmark-inspired glyph (blue rounded square +
 * white "Z" speech bubble). Use `text-[#0068FF]` (Zalo blue) on the
 * parent so the mark adopts the brand color.
 */
export function ZaloBrand(props: {
  size?: number;
  className?: string;
}) {
  const { size = 24, className } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
      className={className}
    >
      {/* Speech bubble */}
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.04 2 11c0 2.85 1.5 5.37 3.86 7.04-.13.9-.5 2.05-1.18 3.13a.5.5 0 0 0 .62.74c1.92-.7 3.27-1.5 4.13-2.13 1.1.27 2.27.42 3.49.42h.08c5.52 0 10-4.04 10-9 0-4.96-4.48-9-10-9h0Z"
      />
      {/* Stylised "Z" inside the bubble */}
      <path
        fill="#FFFFFF"
        d="M16.46 7.2H7.92c-.32 0-.6.16-.76.42a.85.85 0 0 0 .04.88l5.06 7.22H7.92a.85.85 0 1 0 0 1.7h8.54c.32 0 .6-.16.76-.42a.85.85 0 0 0-.04-.88l-5.06-7.22h4.34a.85.85 0 1 0 0-1.7Z"
      />
    </svg>
  );
}

export function ChatBubble(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="chat_bubble" {...props} />;
}

export function MarkChatUnread(props: {
  size?: number;
  className?: string;
}) {
  return <StorefrontIcon name="mark_chat_unread" {...props} />;
}

export function FaceRetouchingNatural(props: {
  size?: number;
  className?: string;
}) {
  return <StorefrontIcon name="face_retouching_natural" {...props} />;
}

export function LocalOffer(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="local_offer" {...props} />;
}

export function FilterAlt(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="filter_alt" {...props} />;
}

export function Redeem(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="redeem" {...props} />;
}

export function AddCircle(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="add_circle" {...props} />;
}

export function Share(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="share" {...props} />;
}

export function LocalFireDepartment(props: {
  size?: number;
  className?: string;
}) {
  return <StorefrontIcon name="local_fire_department" {...props} />;
}

export function Add(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="add" {...props} />;
}

export function Remove(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="remove" {...props} />;
}

export function Delete(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="delete" {...props} />;
}

export function Lock(props: { size?: number; className?: string }) {
  return <StorefrontIcon name="lock" {...props} />;
}