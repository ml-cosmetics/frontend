/**
 * Query keys factory. Every feature uses one block here so we never
 * have stringly-typed keys sprinkled across the codebase. The shape
 * is `(domain, scope, ...params)` — consistent with the
 * `keys.ts` convention from the architecture doc.
 */

export const queryKeys = {
  all: ["ml-cosmetics"] as const,

  auth: {
    me: () => [...queryKeys.all, "auth", "me"] as const,
  },

  products: {
    all: () => [...queryKeys.all, "products"] as const,
    list: (params: object) => [...queryKeys.products.all(), "list", params] as const,
    detail: (id: string) => [...queryKeys.products.all(), "detail", id] as const,
    images: (id: string) => [...queryKeys.products.all(), "images", id] as const,
    counts: (params: object) => [...queryKeys.products.all(), "counts", params] as const,
  },

  categories: {
    all: () => [...queryKeys.all, "categories"] as const,
    list: (params: object) => [...queryKeys.categories.all(), "list", params] as const,
    detail: (id: string) => [...queryKeys.categories.all(), "detail", id] as const,
  },

  inventory: {
    all: () => [...queryKeys.all, "inventory"] as const,
    list: (params: object) => [...queryKeys.inventory.all(), "list", params] as const,
    detail: (id: string) => [...queryKeys.inventory.all(), "detail", id] as const,
    byProduct: (productId: string) =>
      [...queryKeys.inventory.all(), "by-product", productId] as const,
  },

  orders: {
    all: () => [...queryKeys.all, "orders"] as const,
    list: (params: object) => [...queryKeys.orders.all(), "list", params] as const,
    detail: (id: string) => [...queryKeys.orders.all(), "detail", id] as const,
  },

  customers: {
    all: () => [...queryKeys.all, "customers"] as const,
    list: (params: object) => [...queryKeys.customers.all(), "list", params] as const,
    detail: (id: string) => [...queryKeys.customers.all(), "detail", id] as const,
  },

  banners: {
    all: () => [...queryKeys.all, "banners"] as const,
    public: () => [...queryKeys.banners.all(), "public"] as const,
    admin: () => [...queryKeys.banners.all(), "admin"] as const,
    detail: (id: string) => [...queryKeys.banners.all(), "detail", id] as const,
  },

  featuredCollections: {
    all: () => [...queryKeys.all, "featured-collections"] as const,
    public: () => [...queryKeys.featuredCollections.all(), "public"] as const,
    adminList: (params: object) =>
      [...queryKeys.featuredCollections.all(), "admin-list", params] as const,
    detail: (id: string) =>
      [...queryKeys.featuredCollections.all(), "detail", id] as const,
  },

  content: {
    all: () => [...queryKeys.all, "content"] as const,
    list: () => [...queryKeys.content.all(), "list"] as const,
    detail: (key: string) => [...queryKeys.content.all(), "detail", key] as const,
  },

  settings: {
    all: () => [...queryKeys.all, "settings"] as const,
    singleton: () => [...queryKeys.settings.all(), "singleton"] as const,
  },

  dashboard: {
    all: () => [...queryKeys.all, "dashboard"] as const,
    summary: () => [...queryKeys.dashboard.all(), "summary"] as const,
  },

  reports: {
    all: () => [...queryKeys.all, "reports"] as const,
    topProducts: () => [...queryKeys.reports.all(), "top-products"] as const,
    lowStock: () => [...queryKeys.reports.all(), "low-stock"] as const,
    recentOrders: () => [...queryKeys.reports.all(), "recent-orders"] as const,
  },

  notifications: {
    all: () => [...queryKeys.all, "notifications"] as const,
    list: (params: object) => [...queryKeys.notifications.all(), "list", params] as const,
    detail: (id: string) => [...queryKeys.notifications.all(), "detail", id] as const,
  },

  shipping: {
    all: () => [...queryKeys.all, "shipping"] as const,
    list: (params: object) => [...queryKeys.shipping.all(), "list", params] as const,
    detail: (id: string) => [...queryKeys.shipping.all(), "detail", id] as const,
  },

  permissions: {
    all: () => [...queryKeys.all, "permissions"] as const,
    roles: () => [...queryKeys.permissions.all(), "roles"] as const,
    role: (id: string) => [...queryKeys.permissions.roles(), id] as const,
    matrix: () => [...queryKeys.permissions.all(), "matrix"] as const,
  },

  costs: {
    all: () => [...queryKeys.all, "costs"] as const,
    list: (params: object) => [...queryKeys.costs.all(), "list", params] as const,
    detail: (id: string) => [...queryKeys.costs.all(), "detail", id] as const,
  },

  activity: {
    all: () => [...queryKeys.all, "activity"] as const,
    list: (params: object) => [...queryKeys.activity.all(), "list", params] as const,
    stats: () => [...queryKeys.activity.all(), "stats"] as const,
  },

  account: {
    all: () => [...queryKeys.all, "account"] as const,
    profile: () => [...queryKeys.account.all(), "profile"] as const,
    activity: () => [...queryKeys.account.all(), "activity"] as const,
  },

  media: {
    all: () => [...queryKeys.all, "media"] as const,
    folders: () => [...queryKeys.media.all(), "folders"] as const,
    list: (params: object) => [...queryKeys.media.all(), "list", params] as const,
    detail: (id: string) => [...queryKeys.media.all(), "detail", id] as const,
    stats: () => [...queryKeys.media.all(), "stats"] as const,
  },

  customerAnalytics: {
    all: () => [...queryKeys.all, "customer-analytics"] as const,
    summary: (period: string) =>
      [...queryKeys.customerAnalytics.all(), "summary", period] as const,
  },
};
