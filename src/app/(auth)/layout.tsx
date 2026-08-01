/**
 * Standalone auth layout. No chrome — the brand panel inside the
 * login page renders the visual identity. This group exists so the
 * admin layout (sidebar + topbar) does not bleed into `/login`.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface text-foreground antialiased">
      {children}
    </div>
  );
}
