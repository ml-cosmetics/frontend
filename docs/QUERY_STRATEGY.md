# Query Strategy

> Conventions and patterns for every TanStack Query in the codebase.

---

## 1. Query key factory

Single source: `src/lib/query/keys.ts`. Every feature owns a block:

```ts
queryKeys.orders.all()
queryKeys.orders.list(params)
queryKeys.orders.detail(id)
```

Rules:

- Always go through the factory. No string literals at call sites.
- List keys include the params object so two filter combos are
  different queries.
- Detail keys include the entity id.
- `*.all()` is used as the broad invalidation target.

---

## 2. Where keys live

| Layer                    | Reads                                     | Writes                                              |
| ------------------------ | ----------------------------------------- | --------------------------------------------------- |
| `useList` hook           | `queryKeys.<domain>.list(params)`         | n/a                                                 |
| `useDetail` hook         | `queryKeys.<domain>.detail(id)`           | n/a                                                 |
| `<create>` mutation      | n/a                                       | `invalidate(<domain>.all())`                        |
| `<update>` mutation      | `setQueryData(<domain>.detail(id), data)` | `invalidate(<domain>.all())`                        |
| `<delete>` mutation      | n/a                                       | `invalidate(<domain>.all())`                        |
| `<toggleXxx>` mutation   | `setQueryData(...)` (optimistic)          | `invalidate(...)` on settle                         |

---

## 3. Defaults

| Concern         | Value / pattern                                            |
| --------------- | ---------------------------------------------------------- |
| `staleTime`     | 60 s for dashboard, 30 s for reports, 5 min for content    |
| `gcTime`        | 5 min (default)                                            |
| `placeholderData` | `paginatedResult<T>()` for paginated lists               |
| `enabled`       | Gated on a non-empty id for detail queries                 |
| `select`        | Only when reshaping data — never for trivial derivations   |
| `refetchOnWindowFocus` | off (avoid surprise refetches in the admin)         |

---

## 4. Optimistic updates

Reserved for cases where:

1. The server returns the new state on success.
2. The mutation can't fail with a partial state.
3. Rollback on error is cheap.

Used in:

- `useUpdateOrderStatus` — patches list + detail cache, rolls back
  on error, invalidates on settle.
- `useToggleBannerStatus` — toggles the row in-place.
- `useAdjustInventory` — patches the single inventory row.

All three follow this skeleton:

```ts
onMutate: async (variables) => {
  await queryClient.cancelQueries({ queryKey: queryKeys.X.all() });
  const previous = queryClient.getQueryData(key);
  queryClient.setQueryData(key, optimisticValue);
  return { previous, key };
},
onError: (_e, _v, ctx) => {
  if (ctx?.previous) queryClient.setQueryData(ctx.key, ctx.previous);
  toast.error(...);
},
onSettled: (_d, _e, vars) => {
  void queryClient.invalidateQueries({ queryKey: queryKeys.X.all() });
},
```

---

## 5. No duplicate fetching

- List and detail caches are separate (no shared query that fans
  out).
- The global search dialog does its own targeted `per_page: 5`
  queries instead of pulling from the main list cache (avoids forcing
  page 1 to be cached for an unrelated feature).
- React Query devtools are mounted in development to surface
  duplicate fetches early.

---

## 6. Error handling

Every hook returns errors as `APIError` (from `@/lib/api`). Toast
notifications are owned by the mutation `onError` callbacks. Pages
that render the result of a query use `<CrudListShell>` or
`<ErrorState>` to surface the error with a retry button.

---

## 7. Suspense

Server components stream data through `Suspense`. Client lists
defer their initial render via `<CrudListShell>` loading state
(React Query takes the role of Suspense for client components).

---

## 8. Cross-cutting cache resets

- Logout (`useAdminAuth().logout()`) clears the React Query cache so
  a re-login doesn't see stale data from a previous session.
- 401 from any axios request clears the in-memory token and emits
  the auth event handled above.

---

## 9. Anti-patterns

- ❌ `useQuery` with `queryFn: () => fetch(...)` — go through a typed
  API client.
- ❌ `queryKey: ["orders"]` — go through the factory.
- ❌ `onSuccess: (data) => setState(data)` — let the query own the
  data; read it via `useQuery` in the component that needs it.
- ❌ `staleTime: 0` on dashboard/report queries — those should be
  cheap to revalidate but not eager.