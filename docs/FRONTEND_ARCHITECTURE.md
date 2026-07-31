# Frontend Architecture — ML Cosmetics

> Single source of truth for how the Next.js 15 admin + storefront is
> structured. Reflects the code as it ships.

---

## 1. Tech stack

| Concern       | Choice                                                  |
| ------------- | ------------------------------------------------------- |
| Framework     | Next.js 15 (App Router)                                 |
| Language      | TypeScript (strict)                                     |
| Styling       | Tailwind CSS v4 (`@theme` tokens, Aura Vénus palette)   |
| UI primitives | shadcn/ui (Radix under the hood)                        |
| Data          | TanStack Query (client) + RSC                           |
| Forms         | React Hook Form + Zod                                   |
| HTTP client   | Axios (typed envelopes, two instances)                  |
| Icons         | Lucide                                                  |
| Toasts        | Sonner                                                  |
| Theme         | next-themes (admin-only light/dark)                     |

---

## 2. Folder layout

```
src/
├── app/                 Next.js routes (App Router)
│   ├── (admin)/         Authenticated admin surface
│   ├── (auth)/          /login + RedirectIfAuthenticated gate
│   ├── (public)/        Storefront
│   ├── loading.tsx      Global streaming fallback
│   ├── error.tsx        Global error boundary
│   ├── not-found.tsx    404
│   ├── sitemap.ts       Storefront sitemap
│   └── robots.ts        Crawler rules
├── components/
│   ├── ui/              28 shadcn primitives + custom (date-picker, sheet, popover, file-upload, image-upload, search-input, radio-group, typography)
│   ├── common/          Cross-feature building blocks (PageHeader, SectionHeader, EmptyState, ErrorState, Pagination, StatCard, LoadingOverlay, …)
│   │   └── crud/        Shared CRUD primitives — see §5
│   ├── layout/          AdminShell, PublicShell, Topbar, Sidebar, Footer, Container, Section, Navigation, Logo
│   └── storefront/      Storefront-only sections
├── features/            Domain features (one folder per aggregate)
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
├── hooks/               App-level generic hooks (useLocalStorageState, useMounted, useMediaQuery)
├── lib/
│   ├── api/             Axios factory + typed endpoints + errors
│   ├── auth/            Admin session bootstrap + token store
│   ├── query/           Query-keys factory
│   └── utils/           Pure helpers (cn, date, money, number, pagination, image)
├── providers/           Client providers (theme, react-query, auth)
├── styles/              Tailwind + Aura Vénus tokens
└── types/               Canonical wire-format + domain types
```

---

## 3. Route groups

| Group       | Layout            | Access    |
| ----------- | ----------------- | --------- |
| `(admin)`   | `AdminShell`      | Protected |
| `(auth)`    | Auth chrome       | Public    |
| `(public)`  | `PublicShell`     | Public    |

`AdminShell` mounts `ProtectedRoute` so every admin route auto-bounces
unauthenticated visitors to `/login?next=…`.

---

## 4. API layer

### Two Axios instances

- `publicApiClient` — catalog / public. Never attaches JWT.
- `adminApiClient` — admin only. Injects JWT and emits `unauthorized`
  / `forbidden` events that `AdminAuthProvider` consumes.

Both instances share an envelope-unwrap + error-normalisation layer.
Callers always see `APIError`, never `AxiosError`.

### Error normalisation

The 401 response clears the in-memory token and emits
`{ kind: "unauthorized", url }`. The 403 response emits
`{ kind: "forbidden", url }`. Both are observed by the auth provider.

### Resource layout

- `src/lib/api/<resource>.ts` — public typed client
- `src/features/<feature>/api/<feature>-api.ts` — admin wrapper using
  `adminApiClient` (and adds feature-scoped helpers where useful)

---

## 5. Shared CRUD primitives

`src/components/common/crud/` holds the building blocks extracted from
the products feature. Every CRUD-style feature reuses these.

| Export                | Purpose                                                         |
| --------------------- | --------------------------------------------------------------- |
| `CrudForm`            | RHF + Zod wrapper with dirty-state guard, `Ctrl+S`/`Esc`, `LoadingOverlay`, redirect on success |
| `CrudField`           | Single labelled input row (handles required + error message)    |
| `generateSlug`        | Vietnamese-safe slug (NFD strip diacritics)                     |
| `CrudFilterBar`       | List-page toolbar (filters left, CTA right)                     |
| `CrudListShell`       | Loading / error / data / empty-state wrapper                    |
| `useDebouncedValue`   | Debounce (350 ms default) for filter inputs                     |
| `DeleteEntityDialog`  | Controlled destructive dialog                                    |
| `EntityActionMenu`    | Per-row dropdown menu                                           |
| `CrudStatusFilter`    | Pill-style status toggle with `aria-pressed`                    |
| `StockBadge`          | Three-level stock chip (in / low / out)                         |
| `DateRangeText`       | Banner scheduling period formatter                              |
| `useUnsavedChangesGuard` | `beforeunload` listener + `promptIfDirty()`                  |
| `useCrudFormKeyboard` | Global `Ctrl/Cmd+S` submit + `Esc` cancel shortcut              |

---

## 6. Design system

**Aura Vénus** is the single source of truth. Tokens live in
`src/styles/` and are wired into Tailwind v4 via `@theme`.

- Never use ad-hoc colors, radii, or spacing — always pull from the
  palette + spacing scale.
- Use `<Button>`, `<Badge>`, `<Card>`, `<StatCard>`, `<Dialog>`,
  `<Sheet>`, `<Table>`, `<Input>`, `<Select>`, etc. from
  `src/components/ui/`.
- Page-level chrome uses `PageHeader` + `SectionHeader`.
- Typography is provided by `src/components/ui/typography.tsx`
  (`Display`, `Headline`, `Body`, `TextLabel`, `Code`).

---

## 7. State management

See [`docs/STATE_MANAGEMENT.md`](./STATE_MANAGEMENT.md) for full
detail. Summary:

- **Server state** → TanStack Query.
- **URL state** → `useSearchParams` (feature-scoped
  `use<Feature>ListUrlState` hook).
- **Local UI state** → `useState` / `useReducer` per component.
- **Session** → `useAdminAuth()` (subscribed to the auth bridge).
- **Theme** → `next-themes`.

---

## 8. Conventions

- **No inline duplicated className clusters** — pull repeated patterns
  into a primitive.
- **No domain logic in `src/components/ui/`** — only design-system
  primitives.
- **No ad-hoc fetch outside `src/lib/api`** — typed endpoints only.
- **Strict TypeScript** — `any` is forbidden, `unknown` requires a
  narrowing, type imports use `import type`.
- **Vietnamese user-facing strings** — keep tone consistent with the
  rest of the admin.

---

## 9. Performance

- **Stable query keys** through the `queryKeys.<domain>.*` factory.
- **`placeholderData`** on every paginated list query to avoid
  full-table flicker on page change.
- **`staleTime`** per query family (dashboard 60 s, reports 30 s, etc.).
- **Optimistic updates** for status toggles and order-status
  transitions, with explicit rollback on error.
- **`useCallback` on handlers** passed into TanStack column builders.
- **`useMemo` on column arrays** so React Table doesn't rebuild its
  tree each render.
- **Dynamic imports** for large dialogs (e.g. inventory adjustment).
- **`force-dynamic`** on every admin route group page that uses
  `useSearchParams` or streams data.

---

## 10. Accessibility

- Skip-link on `AdminShell` (`Bỏ qua đến nội dung chính`).
- Focus-trapping dialogs (Radix `Dialog` primitive).
- `aria-label` on every icon-only button.
- `aria-current="page"` on the active sidebar entry.
- `aria-live="polite"` on streaming + empty/error states.
- `aria-describedby` linking form errors to inputs.
- `scope="col"` on every table header.
- `<main role="main">` on the admin container.

---

## 11. Security

- JWT lives in `localStorage` (token store) — never in cookies shared
  with subdomains.
- `dangerouslySetInnerHTML` only used in the contact page for the
  admin-supplied Google Maps `<iframe>` embed; the value is rendered
  verbatim and the source is trusted.
- No `console.log` of auth tokens, passwords, or PII. Production
  error logging goes through the global error boundary in
  `app/error.tsx`.
- 401 handling automatically clears the in-memory token and bounces
  to `/login`. 403 handling emits an event for the UI surface to
  react to without auto-logout.

---

## 12. Build, lint, typecheck

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # next lint
npm run build        # production build
```

All three must pass cleanly before release. CI runs them in this order.