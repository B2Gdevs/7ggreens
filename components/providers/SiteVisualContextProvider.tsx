import type { ReactNode } from "react";

/**
 * 7greens local VCS provider — no external package needed.
 * Simply passes children through; the local DevPanel scans DOM
 * for [data-cid] attributes at runtime.
 */
export function SiteVisualContextProvider({ children }: { children: ReactNode }) {
  return children;
}
