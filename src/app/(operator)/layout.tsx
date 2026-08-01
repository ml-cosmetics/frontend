import type { Metadata } from "next";
import { OperatorShell } from "@/components/layout";

/**
 * `(operator)` route group. Hosts the OperOps public-facing surfaces
 * (currently just `/ops`). The shell mirrors the dark Monolith admin
 * chrome but is **not** auth-gated — per the canonical mapping, the
 * operator console is intentionally reachable from the public side.
 */
export const metadata: Metadata = {
  title: "Dashboard",
  description: "OperOps — Dashboard of ML Cosmetics operations.",
};

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return <OperatorShell>{children}</OperatorShell>;
}
