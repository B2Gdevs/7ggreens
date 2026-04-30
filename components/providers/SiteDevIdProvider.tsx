"use client";

import type { ReactNode } from "react";
import { DevIdProvider, DevPanel } from "gad-visual-context";
import { Toaster } from "sonner";

/**
 * Wraps the site in gad-visual-context's DevIdProvider and mounts the
 * DevPanel + sonner Toaster (used by DevPanel for copy-to-clipboard
 * notifications). The panel is always available — Alt+I (or the
 * package's configured shortcut) toggles it.
 *
 * The panel is intentionally on in production: visible cids are not
 * sensitive and operator uses the panel as a point-and-build-context
 * tool when feeding tasks to AI agents.
 */
export function SiteDevIdProvider({ children }: { children: ReactNode }) {
  return (
    <DevIdProvider>
      {children}
      <DevPanel mode="section" />
      <Toaster position="bottom-right" richColors theme="light" />
    </DevIdProvider>
  );
}
