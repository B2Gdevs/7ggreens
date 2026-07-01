import type { ReactNode } from "react";

/**
 * 7greens local VCS provider — passthrough only. The canonical
 * @experience/vcs-sheet ContextSheet (mounted via components/VcsPanel.tsx
 * in app/layout.tsx) scans DOM for [data-cid] attributes at runtime.
 */
export function SiteVisualContextProvider({ children }: { children: ReactNode }) {
  return children;
}
