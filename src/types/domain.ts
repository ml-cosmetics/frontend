/**
 * Shared domain types — keep these in sync with the Go backend
 * (see `backend/internal/domain/` and `backend/internal/service/.../models.go`).
 * Do not duplicate shapes per feature; import from here.
 *
 * All money is BIGINT VND on the wire (no decimals). All timestamps
 * come back as ISO-8601 strings (Go time.Time standard encoding).
 * All IDs are UUIDs — typed as `string` on the frontend.
 */

/** UUID v7 / v4 — opaque string. */
export type ID = string;

/** ISO-8601 timestamp string, always UTC, like `2025-01-15T10:00:00Z`. */
export type ISODateString = string;

/** BIGINT VND. 1 VND = 1 unit. Never use floating-point for money. */
export type VND = number;

// ---------------------------------------------------------------------------
// Enums / status unions
// ---------------------------------------------------------------------------

export const ProductStatus = {
  Draft: "draft",
  Active: "active",
  Archived: "archived",
} as const;
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const OrderStatus = {
  Created: "created",
  Shipping: "shipping",
  Done: "done",
  Cancelled: "cancelled",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderChannel = {
  Facebook: "facebook",
  Zalo: "zalo",
  Instagram: "instagram",
  Website: "website",
  Other: "other",
} as const;
export type OrderChannel = (typeof OrderChannel)[keyof typeof OrderChannel];

export const PaymentMethod = {
  BankTransfer: "bank_transfer",
  Cash: "cash",
  Card: "card",
  Other: "other",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const ShipmentStatus = {
  Pending: "pending",
  InTransit: "in_transit",
  OutForDelivery: "out_for_delivery",
  Delivered: "delivered",
  Exception: "exception",
  Returned: "returned",
} as const;
export type ShipmentStatus =
  (typeof ShipmentStatus)[keyof typeof ShipmentStatus];

export const Carrier = {
  Manual: "manual",
  GHN: "ghn",
  GHTK: "ghtk",
  ViettelPost: "viettel_post",
  VNPost: "vnpost",
  Other: "other",
} as const;
export type Carrier = (typeof Carrier)[keyof typeof Carrier];

export const ExpenseCategory = {
  Cogs: "cogs",
  Shipping: "shipping",
  Marketing: "marketing",
  Salary: "salary",
  Overhead: "overhead",
  Tax: "tax",
  Other: "other",
} as const;
export type ExpenseCategory =
  (typeof ExpenseCategory)[keyof typeof ExpenseCategory];

export const ExpenseStatus = {
  Pending: "pending",
  Paid: "paid",
  Void: "void",
} as const;
export type ExpenseStatus = (typeof ExpenseStatus)[keyof typeof ExpenseStatus];

// ---------------------------------------------------------------------------
// User (auth)
// ---------------------------------------------------------------------------

export interface User {
  id: ID;
  /**
   * Username used to sign in. Required by the type so call sites can
   * safely render `${user.username}` in the chrome — but the JWT
   * payload only carries `sub` (UUID), not the literal username.
   * We mirror `sub` into `username` as a stable identifier. If the
   * admin profile API later exposes the literal username, prefer
   * that field; until then `username === user.id` for admin users.
   */
  username: string;
  role: string;
  /**
   * Optional fields that may or may not be present on the wire depending
   * on how the backend chose to project this resource. Kept optional so
   * the admin shell can render with a partial record. The login
   * response only carries `{ id, role }` — these other fields are
   * populated via separate admin endpoints, not from the JWT.
   */
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

export interface LoginResponse {
  /** Bearer token to attach to subsequent admin requests. */
  token: string;
  /** Role claim — also embedded in the JWT but surfaced here for convenience. */
  role: string;
}

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------

export interface ProductImage {
  id: ID;
  product_id?: ID;
  /** Raw storage key — use this when sending `image_keys` back to the backend. */
  object_key: string;
  image_url: string;
  sort_order: number;
}

export interface ProductListItem {
  id: ID;
  name: string;
  slug: string;
  description: string;
  status: ProductStatus;
  price: VND;
  compare_at?: VND | null;
  cost?: VND | null;
  /** Backed by the first product image; empty string when no image. */
  thumbnail_url: string;
  /** Optional category projection returned by the list endpoint. */
  category?: { id: ID; name: string; slug: string } | null;
  /**
   * Denormalised from `inventories` via LEFT JOIN in the product list
   * repository. `null` when no inventory row exists yet for this
   * product; treat as "out of stock" when missing.
   */
  stock_quantity?: VND | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Product extends Omit<ProductListItem, "thumbnail_url"> {
  images: ProductImage[];
}

export interface CreateProductInput {
  name: string;
  slug: string;
  description?: string;
  status?: ProductStatus;
  price: VND;
  compare_at?: VND | null;
  cost?: VND | null;
  /** Storage object keys returned by `POST /v1/admin/upload`. */
  image_keys?: string[];
  category_id?: ID | null;
  /**
   * Auto-create an inventory row with this quantity when the product
   * is created. Leave undefined to skip inventory bootstrap — the
   * admin can adjust it later via `/admin/inventory`.
   */
  initial_quantity?: VND | null;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  status?: ProductStatus;
  price?: VND;
  compare_at?: VND | null;
  cost?: VND | null;
  /**
   * Replaces the product's image list when present. Keys come from
   * `POST /v1/admin/upload` and are persisted to `product_images`
   * in array order (sort_order = index).
   */
  image_keys?: string[];
  category_id?: ID | null;
  /** Set when `category_id` is omitted but the caller wants to detach. */
  clear_category?: boolean;
}

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

export interface Category {
  id: ID;
  name: string;
  slug: string;
  description: string;
  parent_id?: ID | null;
  sort_order: number;
  is_active: boolean;
  /**
   * Number of non-deleted products attached to this category.
   * Populated by `GET /v1/categories` (single LEFT JOIN aggregation);
   * defaults to 0 on single-record reads (`GET /v1/categories/:id`).
   */
  product_count?: number;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  parent_id?: ID | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  parent_id?: ID | null;
  sort_order?: number;
  is_active?: boolean;
}

// ---------------------------------------------------------------------------
// Customer
// ---------------------------------------------------------------------------

export interface Customer {
  id: ID;
  full_name: string;
  phone: string;
  email?: string | null;
  facebook?: string | null;
  address?: string | null;
  note?: string | null;
  total_orders?: number;
  total_spent?: number;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface CreateCustomerInput {
  full_name: string;
  phone: string;
  email?: string | null;
  facebook?: string | null;
  address?: string | null;
  note?: string | null;
}

export interface UpdateCustomerInput {
  full_name?: string;
  email?: string | null;
  facebook?: string | null;
  address?: string | null;
  note?: string | null;
}

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export interface Inventory {
  id: ID;
  product_id: ID;
  quantity: number;
  created_at: ISODateString;
  updated_at: ISODateString;
  /**
   * Enriched product summary returned by the backend list/detail
   * endpoint. The admin inventory page uses this to render product
   * name, thumbnail, price, and category without additional API calls.
   * Null when the product has been hard-deleted.
   */
  product?: {
    id: ID;
    name: string;
    slug: string;
    status: ProductStatus;
    price: VND;
    compare_at?: VND | null;
    thumbnail_url: string;
    category?: {
      id: ID;
      name: string;
      slug: string;
    } | null;
  } | null;
}

export interface CreateInventoryInput {
  product_id: ID;
  quantity: number;
}

export interface UpdateInventoryInput {
  quantity: number;
}

export interface AdjustInventoryInput {
  quantity: number;
  /**
   * Optional human-readable note attached to the adjustment. The
   * backend currently accepts it on `set-quantity` / `increase` /
   * `decrease`; it is forwarded to the audit log when present.
   */
  reason?: string;
}

// ---------------------------------------------------------------------------
// Order
// ---------------------------------------------------------------------------

export interface OrderItem {
  id: ID;
  product_id: ID;
  // Product is filled in by the backend when the order is loaded
  // (the service mapper projects the product name + thumbnail onto
  // the wire). Null when the product row has been deleted.
  product?: OrderItemProductRef | null;
  quantity: number;
  unit_price: VND;
  subtotal: VND;
}

export interface OrderItemProductRef {
  id: ID;
  name: string;
  slug: string;
  thumbnail_url: string;
}

export interface OrderCustomerRef {
  id: ID;
  full_name: string;
  phone: string;
  email?: string | null;
}

export interface Order {
  id: ID;
  customer_id: ID;
  // Customer is the slim projection the backend injects so the admin
  // list/detail can render the customer's name + phone without an
  // extra round-trip. Null when the customer row has been deleted.
  customer?: OrderCustomerRef | null;
  status: OrderStatus;
  total: VND;
  note?: string;
  items: OrderItem[];
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface CreateOrderItemInput {
  product_id: ID;
  quantity: number;
  unit_price: VND;
}

export interface CreateOrderInput {
  customer_id: ID;
  note?: string;
  items: CreateOrderItemInput[];
}

export interface UpdateOrderInput {
  note?: string | null;
  status?: OrderStatus;
}

// ---------------------------------------------------------------------------
// Banner
// ---------------------------------------------------------------------------

export interface BannerPublic {
  id: ID;
  title: string;
  subtitle?: string | null;
  image_url: string;
  link?: string | null;
  position: number;
}

export interface Banner extends BannerPublic {
  image_key: string;
  is_active: boolean;
  starts_at?: ISODateString | null;
  ends_at?: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface CreateBannerInput {
  title: string;
  subtitle?: string | null;
  image_key: string;
  link?: string | null;
  position?: number;
  is_active?: boolean;
  starts_at?: ISODateString | null;
  ends_at?: ISODateString | null;
}

export interface UpdateBannerInput {
  title?: string;
  subtitle?: string | null;
  image_key?: string;
  link?: string | null;
  position?: number;
  is_active?: boolean;
  starts_at?: ISODateString | null;
  ends_at?: ISODateString | null;
}

// ---------------------------------------------------------------------------
// Featured Collection ("Bộ sưu tập nổi bật")
// ---------------------------------------------------------------------------

/**
 * Visual layout hint returned by the backend. The storefront picks
 * the right grid template based on this value:
 *   - "bento" → hero + side stack (used for 2–3 items)
 *   - "grid"  → responsive grid that scales the tile size as the
 *               item count grows (used for 4+ items)
 */
export type FeaturedCollectionLayout = "bento" | "grid";

/** Slim product view embedded in a public featured-collection item. */
export interface FeaturedCollectionProduct {
  id: ID;
  name: string;
  slug: string;
  status: ProductStatus;
  price: VND;
  compare_at?: VND | null;
  /** First product image URL resolved by the backend. */
  thumbnail_url: string;
}

/** A single item inside a featured collection (product + ordering). */
export interface FeaturedCollectionItem {
  id: ID;
  sort_order: number;
  product: FeaturedCollectionProduct;
}

/** Public storefront shape of one featured collection. */
export interface FeaturedCollectionPublic {
  id: ID;
  slug: string;
  title: string;
  subtitle?: string | null;
  image_url: string;
  layout: FeaturedCollectionLayout;
  is_active: boolean;
  sort_order: number;
  items: FeaturedCollectionItem[];
}

/** Admin shape — adds image_key + timestamps. */
export interface FeaturedCollection extends FeaturedCollectionPublic {
  image_key: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface CreateFeaturedCollectionInput {
  slug?: string;
  title: string;
  subtitle?: string | null;
  image_key: string;
  layout?: FeaturedCollectionLayout;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateFeaturedCollectionInput {
  slug?: string;
  title?: string;
  subtitle?: string | null;
  image_key?: string;
  layout?: FeaturedCollectionLayout;
  is_active?: boolean;
  sort_order?: number;
}

/** Admin "save picker" payload — replaces the full product list. */
export interface SetFeaturedCollectionItemsInput {
  product_ids: ID[];
}

// ---------------------------------------------------------------------------
// Website content
// ---------------------------------------------------------------------------

export interface ContentSection {
  key: string;
  title?: string | null;
  content?: string | null;
}

export interface UpdateContentInput {
  title?: string | null;
  content?: string | null;
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export interface Settings {
  company_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  zalo_url?: string | null;
  messenger_url?: string | null;
  tiktok_url?: string | null;
  youtube_url?: string | null;
  logo_url?: string | null;
  favicon_url?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  google_map_embed?: string | null;
  working_hours?: string | null;
}

export interface UpdateSettingsInput {
  company_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  zalo_url?: string | null;
  messenger_url?: string | null;
  tiktok_url?: string | null;
  youtube_url?: string | null;
  logo_key?: string | null;
  favicon_key?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  google_map_embed?: string | null;
  working_hours?: string | null;
}

export interface SettingsUploadOutput {
  key: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface DashboardMetrics {
  products: ProductMetrics;
  categories: CategoryMetrics;
  customers: CustomerMetrics;
  orders: OrderMetrics;
  inventory: InventoryMetrics;
}

export interface ProductMetrics {
  total: number;
  active: number;
  draft: number;
  archived: number;
}

export interface CategoryMetrics {
  total: number;
  active: number;
}

export interface CustomerMetrics {
  total: number;
}

export interface OrderMetrics {
  total: number;
  created: number;
  shipping: number;
  done: number;
  cancelled: number;
}

export interface InventoryMetrics {
  products: number;
  out_of_stock: number;
  low_stock: number;
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export interface TopProductItem {
  product_id: ID;
  name: string;
  quantity_sold: number;
}

export interface TopProductsOutput {
  items: TopProductItem[];
}

export interface LowStockItem {
  product_id: ID;
  name: string;
  quantity: number;
}

export interface LowStockOutput {
  items: LowStockItem[];
}

export interface RecentOrderItem {
  id: ID;
  customer_name: string;
  status: OrderStatus;
  total: VND;
  created_at: ISODateString;
}

export interface RecentOrdersOutput {
  items: RecentOrderItem[];
}

export interface TopCustomerItem {
  id: ID;
  full_name: string;
  total_orders: number;
  total_spent: number;
}

export interface TopCustomersOutput {
  items: TopCustomerItem[];
}

// ---------------------------------------------------------------------------
// Notifications (LuxeOps Trung tâm Thông báo)
// ---------------------------------------------------------------------------

export const NotificationCategory = {
  Order: "order",
  Inventory: "inventory",
  Customer: "customer",
  System: "system",
  Shipping: "shipping",
  Cost: "cost",
} as const;
export type NotificationCategory =
  (typeof NotificationCategory)[keyof typeof NotificationCategory];

export const NotificationSeverity = {
  Info: "info",
  Warning: "warning",
  Critical: "critical",
  Success: "success",
} as const;
export type NotificationSeverity =
  (typeof NotificationSeverity)[keyof typeof NotificationSeverity];

export interface Notification {
  id: ID;
  title: string;
  body: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  is_read: boolean;
  reference_id?: string | null;
  reference_type?: string | null;
  created_at: ISODateString;
  read_at?: ISODateString | null;
}

export interface NotificationPreferences {
  new_order: boolean;
  low_stock: boolean;
  new_customer: boolean;
  system_alerts: boolean;
  shipping_updates: boolean;
}

export interface UpdateNotificationPreferencesInput {
  new_order?: boolean;
  low_stock?: boolean;
  new_customer?: boolean;
  system_alerts?: boolean;
  shipping_updates?: boolean;
}

export interface NotificationStats {
  unread: number;
  today: number;
  this_week: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Shipping (LuxeOps Quản lý Vận chuyển)
// ---------------------------------------------------------------------------

export interface Shipment {
  id: ID;
  tracking_code: string;
  order_id: ID;
  order_code: string;
  customer_name: string;
  carrier: Carrier;
  status: ShipmentStatus;
  shipping_fee: VND;
  created_at: ISODateString;
  updated_at: ISODateString;
  expected_delivery_at?: ISODateString | null;
  delivered_at?: ISODateString | null;
}

export interface CreateShipmentInput {
  order_id: ID;
  carrier: Carrier;
  status?: ShipmentStatus;
  shipping_fee?: VND;
  expected_delivery_at?: ISODateString | null;
}

export interface UpdateShipmentInput {
  carrier?: Carrier;
  status?: ShipmentStatus;
  shipping_fee?: VND;
  expected_delivery_at?: ISODateString | null;
}

export interface ShippingStats {
  in_transit: number;
  in_transit_value: VND;
  delivered_today: number;
  delivered_rate: number;
  returning: number;
  returning_delta: number;
  monthly_fee: VND;
  projected_fee: VND;
}

// ---------------------------------------------------------------------------
// Permissions / RBAC (LuxeOps Quản lý Phân quyền)
// ---------------------------------------------------------------------------

export const PermissionAction = {
  View: "view",
  Create: "create",
  Update: "update",
  Delete: "delete",
  Approve: "approve",
} as const;
export type PermissionAction = (typeof PermissionAction)[keyof typeof PermissionAction];

export const PermissionModule = {
  Products: "products",
  Categories: "categories",
  Inventory: "inventory",
  Orders: "orders",
  Customers: "customers",
  Shipping: "shipping",
  Content: "content",
  Banners: "banners",
  FeaturedCollections: "featured_collections",
  Media: "media",
  Settings: "settings",
  Permissions: "permissions",
  Costs: "costs",
  Notifications: "notifications",
} as const;
export type PermissionModule =
  (typeof PermissionModule)[keyof typeof PermissionModule];

export interface Role {
  id: ID;
  name: string;
  description: string;
  is_system: boolean;
  member_count: number;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface CreateRoleInput {
  name: string;
  description?: string;
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
}

export interface PermissionCell {
  module: PermissionModule;
  action: PermissionAction;
  granted: boolean;
}

export interface PermissionMatrix {
  role_id: ID;
  role_name: string;
  cells: PermissionCell[];
}

export interface UpdatePermissionMatrixInput {
  cells: PermissionCell[];
}

export interface PermissionStats {
  roles: number;
  members: number;
  permissions: number;
  owner_count: number;
}

// ---------------------------------------------------------------------------
// Costs (LuxeOps Quản lý Chi phí)
// ---------------------------------------------------------------------------

export interface Cost {
  id: ID;
  code: string;
  occurred_on: ISODateString;
  category: ExpenseCategory;
  description: string;
  vendor: string;
  amount: VND;
  status: ExpenseStatus;
  note?: string | null;
  receipt_url?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface CreateCostInput {
  occurred_on: ISODateString;
  category: ExpenseCategory;
  description: string;
  vendor: string;
  amount: VND;
  status?: ExpenseStatus;
  note?: string | null;
}

export interface UpdateCostInput {
  occurred_on?: ISODateString;
  category?: ExpenseCategory;
  description?: string;
  vendor?: string;
  amount?: VND;
  status?: ExpenseStatus;
  note?: string | null;
}

export interface CostStats {
  monthly_total: VND;
  monthly_delta: number;
  average_per_order: VND;
  top_category: { category: ExpenseCategory; amount: VND; share: number };
}

// ---------------------------------------------------------------------------
// Activity log (LuxeOps Nhật ký hoạt động)
// ---------------------------------------------------------------------------

export const ActivityLevel = {
  Info: "info",
  Warning: "warning",
  Critical: "critical",
} as const;
export type ActivityLevel = (typeof ActivityLevel)[keyof typeof ActivityLevel];

export const ActivityAction = {
  Create: "create",
  Update: "update",
  Delete: "delete",
  Login: "login",
  Logout: "logout",
  Payment: "payment",
  Settings: "settings",
  Alert: "alert",
  Backup: "backup",
  Shipment: "shipment",
  Other: "other",
} as const;
export type ActivityAction =
  (typeof ActivityAction)[keyof typeof ActivityAction];

export interface ActivityLog {
  id: ID;
  occurred_at: ISODateString;
  actor_name: string;
  actor_kind: "user" | "system";
  action: ActivityAction;
  target: string;
  level: ActivityLevel;
  ip_address: string;
  user_agent?: string | null;
}

export interface ActivityTimelineBucket {
  /** 0..23 hour-of-day bucket. */
  hour: number;
  count: number;
}

export interface ActivityUser {
  name: string;
  count: number;
}

export interface ActivityStats {
  today: number;
  this_week: number;
  logins: number;
  alerts: number;
  timeline: ActivityTimelineBucket[];
  top_users: ActivityUser[];
}

// ---------------------------------------------------------------------------
// Account / Profile (LuxeOps Hồ sơ cá nhân Mỹ Lệ)
// ---------------------------------------------------------------------------

export const AccountGender = {
  Female: "female",
  Male: "male",
  Other: "other",
} as const;
export type AccountGender = (typeof AccountGender)[keyof typeof AccountGender];

export const AccountTimeFormat = {
  H24: "24h",
  H12: "12h",
} as const;
export type AccountTimeFormat =
  (typeof AccountTimeFormat)[keyof typeof AccountTimeFormat];

export const AccountLanguage = {
  Vietnamese: "vi",
  English: "en",
} as const;
export type AccountLanguage =
  (typeof AccountLanguage)[keyof typeof AccountLanguage];

export interface AccountProfile {
  id: ID;
  full_name: string;
  email: string;
  phone: string;
  role_label: string;
  joined_at: ISODateString;
  date_of_birth?: ISODateString | null;
  gender?: AccountGender | null;
  bio?: string | null;
  avatar_url?: string | null;
  language: AccountLanguage;
  timezone: string;
  time_format: AccountTimeFormat;
  address?: {
    house_number?: string | null;
    street?: string | null;
    ward?: string | null;
    district?: string | null;
    province?: string | null;
  } | null;
  stats: {
    orders_handled: number;
    reviews: number;
  };
}

export interface UpdateAccountProfileInput {
  full_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: ISODateString | null;
  gender?: AccountGender | null;
  bio?: string | null;
  language?: AccountLanguage;
  timezone?: string;
  time_format?: AccountTimeFormat;
  address?: AccountProfile["address"];
}

export interface AccountActivityItem {
  id: ID;
  title: string;
  occurred_at: ISODateString;
}

// ---------------------------------------------------------------------------
// Media library (LuxeOps Thư viện Media)
// ---------------------------------------------------------------------------

export const MediaKind = {
  Image: "image",
  Video: "video",
  Document: "document",
  Other: "other",
} as const;
export type MediaKind = (typeof MediaKind)[keyof typeof MediaKind];

export interface MediaFolder {
  id: ID;
  name: string;
  parent_id?: ID | null;
  asset_count: number;
  kind: MediaKind;
}

export interface MediaAsset {
  id: ID;
  filename: string;
  mime: string;
  kind: MediaKind;
  width?: number | null;
  height?: number | null;
  size_bytes: number;
  url: string;
  thumbnail_url?: string | null;
  folder_id?: ID | null;
  uploaded_by: string;
  uploaded_at: ISODateString;
  alt_text?: string | null;
  tags: string[];
  usage: Array<{ label: string; href?: string }>;
}

export interface MediaLibraryStats {
  total_files: number;
  storage_used_bytes: number;
  storage_quota_bytes: number;
  storage_used_ratio: number;
}

// ---------------------------------------------------------------------------
// Customer analytics (LuxeOps Phân tích & Hành vi khách hàng)
// ---------------------------------------------------------------------------

export const AnalyticsChannel = {
  Website: "website",
  Facebook: "facebook",
  Zalo: "zalo",
  Instagram: "instagram",
  TikTok: "tiktok",
  Other: "other",
} as const;
export type AnalyticsChannel =
  (typeof AnalyticsChannel)[keyof typeof AnalyticsChannel];

export const AnalyticsTab = {
  Overview: "overview",
  Traffic: "traffic",
  Behaviour: "behaviour",
  Channels: "channels",
  Products: "products",
} as const;
export type AnalyticsTab = (typeof AnalyticsTab)[keyof typeof AnalyticsTab];

export interface AnalyticsKpi {
  label: string;
  value: string;
  delta?: string;
  trend: "up" | "down" | "flat";
  sparkline_path?: string;
}

export interface AnalyticsChannelShare {
  channel: AnalyticsChannel;
  share: number;
  visitors: number;
}

export interface AnalyticsTopProduct {
  product_id: ID;
  name: string;
  views: number;
  conversions: number;
}

export interface CustomerAnalyticsSummary {
  period_label: string;
  kpis: AnalyticsKpi[];
  channels: AnalyticsChannelShare[];
  top_products: AnalyticsTopProduct[];
}
