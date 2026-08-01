# State Management

> Where state lives in the ML Cosmetics frontend, and which APIs to
> use for each kind.

---

## Categories of state

| Kind              | Where                                                |
| ----------------- | ---------------------------------------------------- |
| Server state      | TanStack Query                                       |
| URL state         | `useSearchParams` via feature-scoped URL-state hook  |
| Session           | `useAdminAuth()` from `@/lib/auth`                   |
| Theme             | `next-themes` (`useTheme`)                           |
| Local UI state    | `useState` / `useReducer` per component              |
| Form state        | React Hook Form                                      |

---

## 1. Server state — TanStack Query

Single client, mounted in `src/providers/query-provider.tsx` (wrapped
in `ThemeProvider` → `QueryProvider`).

### Query keys

Every key is built from a factory in `src/lib/query/keys.ts`:

```ts
queryKeys.orders.list(params)
queryKeys.orders.detail(id)
queryKeys.products.detail(id)
queryKeys.products.images(id)
// …
```

Hooks always import `queryKeys` from `@/lib/query`; never spell keys
out as strings.

### Defaults

- `staleTime` — 60 s for dashboard, 30 s for reports, 30 s for low
  stock, 5 min for content/settings, 0 (default) for the rest.
- `gcTime` — 5 min, the library default.
- `placeholderData` — every paginated list uses
  `paginatedResult<T>()` so the table renders an empty shell during
  refetch and avoids layout shift.
- `enabled` — controlled per query (e.g. detail queries gated on a
  non-empty ID).

### Invalidation strategy

Mutations call:

```ts
queryClient.invalidateQueries({ queryKey: queryKeys.<domain>.all() });
```

to refresh list views, and `setQueryData` for single-record updates
when the backend returns the new value.

### Optimistic updates

Used where the cache can be updated safely before the round-trip:

- `useUpdateOrderStatus` — patches both list + detail cache, rolls
  back on error, invalidates on settle.
- `useToggleBannerStatus` — toggles the row in-place.

Other CRUD hooks prefer invalidate-only to avoid rolling back a
half-applied cascade.

---

## 2. URL state

Every list page owns its `search`, `page`, `per_page`, and (where
relevant) `status` in the URL via a feature-scoped hook:

```ts
useProductListUrlState()  // features/products
useCategoryListUrlState()  // features/categories
useCustomerListUrlState()  // features/customers
useInventoryUrlState()     // features/inventory
useBannerListUrlState()    // features/banners
```

The hook reads/writes via `useSearchParams` + `router.replace` (no
history pollution from typing). URL is the source of truth — refresh
preserves the exact list view.

---

## 3. Session

`useAdminAuth()` in `@/lib/auth` exposes:

```ts
{ user, isAuthenticated, login, logout, ready }
```

It subscribes to the auth-event bridge, so a 401 from any axios
request automatically clears the session and bounces the user to
`/login`. Login persists the token via `tokenStore` (localStorage)
and mirrors it into the axios instance.

---

## 4. Theme

`next-themes` mounted in the admin `Providers` tree. The topbar
provides a sun/moon toggle; the toggle is `aria-pressed`-aware.

---

## 5. Local UI state

Component-local state lives in `useState` / `useReducer`. Examples:

- Dialog open/close
- Delete-row pending state
- Selected file previews
- Search input draft (synced to URL via the debounce hook)

Nothing global goes in `useState`. If something needs to be shared,
it goes in URL, server cache, or the auth bridge.

---

## 6. Forms

Every CRUD form uses `<CrudForm>` from `@/components/common/crud`:

- React Hook Form + Zod
- `useCrudFormKeyboard` (Ctrl+S to submit, Esc to cancel)
- `useUnsavedChangesGuard` (`beforeunload` warning on dirty state)
- `LoadingOverlay` during in-flight mutations
- `redirectTo` on success

---

## 7. What state should NOT do

- No Redux / Zustand / Jotai — the four mechanisms above cover every
  case.
- No shared mutable refs.
- No passing setters through more than two component layers — lift
  to a parent or move to a hook instead.