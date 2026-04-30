"use client";

import { useMemo, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  VisualContextProvider,
  type VCSRouterAdapterValue,
} from "gad-visual-context";

/**
 * 7greens-side adapter wiring Next.js's App Router into the
 * gad-visual-context router context. Mirrors apps/platform's
 * PlatformVisualContextProvider — the package's internals consume
 * <VisualContextProvider router={...}> instead of importing
 * "next/navigation" directly, so each host wires its own router.
 */
export function SiteVisualContextProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const nextRouter = useRouter();
  const adapter = useMemo<VCSRouterAdapterValue>(
    () => ({
      pathname,
      router: {
        push: (href) => nextRouter.push(href),
        replace: (href) => nextRouter.replace(href),
        back: () => nextRouter.back(),
        forward: () => nextRouter.forward(),
        refresh: () => nextRouter.refresh(),
        prefetch: (href) => nextRouter.prefetch(href),
      },
    }),
    [pathname, nextRouter],
  );
  return <VisualContextProvider router={adapter}>{children}</VisualContextProvider>;
}
