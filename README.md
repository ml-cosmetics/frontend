# ML Cosmetics — Frontend

The Next.js 15 + TypeScript frontend for **ML Cosmetics** — a
cosmetic catalog, public company website, and admin backoffice.

The Go backend in `../backend` is the source of truth for every API
shape. The frontend never modifies it.

---

## Tech stack

| Concern         | Choice                                                  |
| --------------- | ------------------------------------------------------- |
| Framework       | Next.js 15 (App Router)                                 |
| Language        | TypeScript (strict)                                     |
| Styling         | Tailwind CSS v4 (`@theme` tokens — Aura Vénus palette)  |
| UI primitives   | shadcn/ui (Radix under the hood)                        |
| Data fetching   | TanStack Query (client) + RSC                           |
| Forms           | React Hook Form + Zod                                   |
| HTTP client     | Axios (typed envelopes, two instances)                  |
| Icons           | Lucide                                                  |
| Toasts          | Sonner                                                  |
| Theme           | next-themes (light + dark on admin)                     |

---

## What's inside

- **Public storefront** (`/`, `/products`, `/products/[slug]`,
  `/about`, `/contact`) — server-rendered, ISR-friendly, lightweight
  client islands.
- **Admin backoffice** (`/admin/*`) — authenticated, dynamic, full
  CRUD for products, categories, inventory, orders, customers,
  banners, content, settings.
- **Dashboard** (`/admin/dashboard`) — KPI summary + top products +
  low-stock alerts + recent orders. The three widget endpoints
  (`/v1/admin/reports/{top-products,low-stock,recent-orders}`) are
  still wired on the backend but no longer have a dedicated
  `/admin/reports` page in the admin UI yet.
- **Global search** — `Ctrl+K` / `⌘K` command palette across products,
  orders, customers, categories.
- **Auth** — JWT in localStorage, 401 auto-redirect, protected admin
  route group.

---

## Getting started

```bash
# 1. install deps (project uses pnpm, not npm)
pnpm install

# 2. env (file is committed as .env; tweak if backend URL changes)
cp .env.example .env.local   # optional — only if you want a local override
# .env already points at http://localhost:8080 + http://localhost:9000

# 3. dev server (port 3000)
pnpm dev
```

The app boots on `http://localhost:3000`. The admin section expects
the backend at `http://localhost:8080` (Gin's default port) and
MinIO at `http://localhost:9000`.

> **Heads-up:** This project uses **pnpm** (committed `pnpm-lock.yaml`).
> Do NOT run `npm install` / `npm run dev` — npm overwrites
> `node_modules/` with a flat layout that breaks Next.js 15, Tailwind 4,
> and the pnpm-only `sharp` / `unrs-resolver` binaries. If you ever
> do, recover with:
> ```bash
> rm -rf node_modules package-lock.json
> pnpm install
> ```

### Scripts

| Script          | Command                                                    |
| --------------- | ---------------------------------------------------------- |
| Dev server      | `pnpm dev`                                                 |
| Production build| `pnpm build`                                               |
| Serve prod      | `pnpm start`                                               |
| Lint            | `pnpm lint`                                                |
| Typecheck       | `pnpm typecheck`                                           |
| Format          | `pnpm format`                                              |

### Adding a dependency

```bash
pnpm add <package>            # runtime dep
pnpm add -D <package>         # dev dep
```

`pnpm-lock.yaml` is the source of truth — commit it alongside `package.json`.

---

## Folder layout

```
src/
├── app/
│   ├── (public)/            Public storefront (Home, Products, About, Contact)
│   ├── (admin)/             Admin backoffice (Dashboard, Products, Orders, …)
│   ├── (auth)/              Standalone auth screens (login)
│   ├── layout.tsx           Root layout + global providers
│   ├── error.tsx            Global error boundary
│   ├── loading.tsx          Global loading UI
│   ├── not-found.tsx        404
│   ├── sitemap.ts           SEO sitemap
│   └── robots.ts            SEO robots
├── components/
│   ├── ui/                  shadcn/ui primitives + custom (Button, Dialog, …)
│   ├── layout/              AdminShell, PublicShell, Topbar, Sidebar, Container, …
│   ├── common/              PageHeader, EmptyState, ErrorState, Pagination, StatCard, …
│   │   └── crud/            Shared CRUD primitives (CrudForm, CrudListShell, …)
│   └── storefront/          Storefront-only sections
├── features/                One folder per domain feature
│   ├── auth/
│   ├── products/
│   ├── categories/
│   ├── inventory/
│   ├── orders/
│   ├── customers/
│   ├── banners/
│   ├── content/
│   ├── settings/
│   └── dashboard/
├── hooks/                   App-level generic hooks (useMounted, useMediaQuery, …)
├── lib/
│   ├── api/                 Axios factory + typed endpoints + errors
│   ├── auth/                Admin session bootstrap + token store
│   ├── query/               Query-keys factory
│   └── utils/               Pure helpers (cn, date, money, number, pagination, image)
├── providers/               Client providers (theme, react-query, auth)
├── styles/                  Tailwind + Aura Vénus tokens
└── types/                   Canonical wire-format + domain types
```

See [`docs/FEATURE_STRUCTURE.md`](./docs/FEATURE_STRUCTURE.md) for
the per-feature skeleton that every CRUD feature follows.

---

## Documentation

| Doc                                          | Covers                                           |
| -------------------------------------------- | ------------------------------------------------ |
| [docs/FRONTEND_ARCHITECTURE.md](./docs/FRONTEND_ARCHITECTURE.md) | Overall architecture, conventions               |
| [docs/STATE_MANAGEMENT.md](./docs/STATE_MANAGEMENT.md)           | Server / URL / session / theme / form state     |
| [docs/QUERY_STRATEGY.md](./docs/QUERY_STRATEGY.md)               | TanStack Query conventions, optimistic updates  |
| [docs/FEATURE_STRUCTURE.md](./docs/FEATURE_STRUCTURE.md)         | Per-feature skeleton + how to add a new feature |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)                       | Build, env vars, hosting, headers, release      |

---

## Design system

Aura Vénus is the single source of truth. Tokens live in
`src/styles/` and are wired into Tailwind v4 via `@theme`. Use only
primitives from `src/components/ui/` and `src/components/common/`.

---

## License

Internal — ML Cosmetics.