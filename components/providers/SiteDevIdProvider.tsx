import type { ReactNode } from "react";
import { DevPanel } from "@/lib/vcs/DevPanel";

/**
 * Mounts the local DevPanel (Alt+I to toggle). No external
 * package dependency — everything lives in lib/vcs/.
 */
export function SiteDevIdProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <DevPanel />
    </>
  );
}
