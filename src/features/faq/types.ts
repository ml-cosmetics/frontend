/**
 * Domain types for the public FAQ.
 *
 * The backend does not expose a dedicated FAQ endpoint, so the page
 * is driven by the `content` API under the `faq` key — same wire
 * shape as every other content section (`title` + `content`).
 *
 * To keep the storefront flexible, the FAQ view also accepts a
 * structured fallback payload (a list of grouped Q&A) so admins
 * that want to author a more interactive list can paste JSON into
 * the content editor and have it render natively.
 */
export interface FaqGroup {
  /** Visible category label — used as the sidebar entry and section heading. */
  category: string;
  /** Short description shown under the category heading. */
  description?: string;
  items: FaqItem[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqContentPayload {
  groups: FaqGroup[];
}