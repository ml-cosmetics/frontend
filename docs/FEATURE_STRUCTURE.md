# Feature Structure

> Every domain feature follows the same skeleton. Consistency is a
> feature.

---

## Skeleton

```
features/<feature>/
├── api/
│   ├── <feature>-api.ts      admin wrapper around lib/api/<feature>.ts
│   └── index.ts              barrel
├── hooks/
│   ├── use-<feature>-list.ts
│   ├── use-<feature>.ts              (single-record)
│   ├── use-create-<feature>.ts
│   ├── use-update-<feature>.ts
│   ├── use-delete-<feature>.ts
│   ├── use-<feature>-list-url-state.ts
│   └── index.ts              barrel
├── components/
│   ├── columns.tsx           TanStack column builder
│   ├── table.tsx             list view
│   ├── form.tsx              create/edit form (RHF + Zod)
│   ├── status-badge.tsx      (only if the feature has statuses)
│   └── *.tsx                 feature-specific dialogs / panels
├── schema.ts                 Zod schemas + defaults + form-to-DTO helpers
└── index.ts                  feature barrel
```

---

## Reference: the products feature

```
src/features/products/
├── api/
│   ├── products-api.ts
│   └── index.ts
├── hooks/
│   ├── use-product-list.ts
│   ├── use-product.ts
│   ├── use-product-images.ts
│   ├── use-create-product.ts
│   ├── use-update-product.ts
│   ├── use-delete-product.ts
│   ├── use-upload-product-image.ts
│   ├── use-delete-product-image.ts
│   ├── use-product-list-url-state.ts
│   ├── use-product-form-state.ts
│   ├── pagination-helpers.ts
│   └── index.ts
├── components/
│   ├── columns.tsx
│   ├── table.tsx
│   ├── form.tsx
│   ├── gallery.tsx
│   ├── status-badge.tsx
│   └── use-debounced-value.ts
├── schema.ts
└── index.ts
```

Every CRUD-style feature (products, categories, inventory, orders,
customers, banners) uses the same shape. Feature-specific extras:

| Feature    | Extras                                                  |
| ---------- | ------------------------------------------------------- |
| products   | image gallery, upload/delete image hooks                |
| inventory  | quantity adjustment dialog, per-row loading state       |
| orders     | status transition dialog, optimistic status update      |
| banners    | date-range display, image preview, status toggle        |
| settings   | logo/favicon upload, content editor dialog             |

---

## Page skeleton

```
src/app/(admin)/admin/<feature>/
├── page.tsx                   list page (Suspense + TableFallback)
├── new/page.tsx               create page (CrudForm + back link)
└── [id]/edit/page.tsx         edit page (CrudForm + back link)
```

Detail-only features (orders) replace `[id]/edit` with `[id]/page.tsx`.

Every page uses:

- `PageHeader` with eyebrow + title + description + actions
- `<Suspense>` with a labelled `Skeleton` fallback (`role="status"`,
  `aria-live="polite"`)
- `export const dynamic = "force-dynamic"` when the page reads
  `useSearchParams` or streams data
- `metadata` (or `generateMetadata` for dynamic routes)

---

## Schema convention

`schema.ts` exports:

- `xxxFormSchema` — the Zod schema for `<CrudForm>`
- `type XxxFormValues = z.infer<typeof xxxFormSchema>`
- `xxxToFormDefaults(entity)` — server → form
- `formToCreateInput(values)` — form → create DTO
- `formToUpdateInput(values)` — form → update DTO

`xxxToFormDefaults` is feature-internal. The DTO conversions handle
empty strings (`""`) → `undefined` so the backend never receives a
required-empty string.

---

## Hook convention

| Hook                        | Purpose                                            |
| --------------------------- | -------------------------------------------------- |
| `use<Feature>List`          | paginated list with `placeholderData`              |
| `use<Feature>`              | single record (gated on id)                        |
| `useCreate<Feature>`        | create mutation + toast + invalidate               |
| `useUpdate<Feature>`        | update mutation + `setQueryData` + invalidate      |
| `useDelete<Feature>`        | delete mutation + invalidate                      |
| `use<Feature>ListUrlState`  | URL-synced search / page / per_page                |

Naming is consistent so any developer can find the right hook by
guessing.

---

## Adding a new feature

1. Create the folder skeleton.
2. Add the resource to `src/lib/api/<feature>.ts` and the admin
   wrapper under `src/features/<feature>/api/`.
3. Add the query-key block to `src/lib/query/keys.ts`.
4. Add `Create/Update` input types to `src/types/domain.ts`.
5. Implement hooks, schema, components, then pages.
6. Add the sidebar entry in `src/components/layout/sidebar.tsx`.
7. Run `npm run typecheck && npm run lint && npm run build`.