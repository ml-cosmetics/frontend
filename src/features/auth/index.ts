/**
 * `features/auth` — admin authentication only.
 *
 * The public storefront has no login (per the product brief), so this
 * namespace exclusively powers the admin section. The actual session
 * logic lives in `lib/auth/admin-auth-provider.tsx` so it can be
 * shared by every admin page.
 *
 * Planned exports (added when feature pages are built):
 *   - useLoginForm() — React Hook Form + Zod wrapper.
 *   - <LoginForm />  — the login page form.
 */
export {};
