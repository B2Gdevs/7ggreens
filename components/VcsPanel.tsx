"use client";

/**
 * VcsPanel — client boundary for the canonical @experience/vcs-sheet
 * ContextSheet. ContextSheet itself does not carry a "use client" pragma
 * (it's a plain React component with hooks), so Next's server-component
 * root layout can't render it directly — this wrapper is the client
 * boundary the App Router requires. Mounted once from app/layout.tsx.
 *
 * cidNamespace/projectId = "7greens" — never hardcode "desk".
 * See packages/vcs-sheet/HOW-TO-MOUNT-THE-IDE-SHEET.md.
 */
import { ContextSheet } from "@experience/vcs-sheet/react";

export function VcsPanel() {
  return <ContextSheet cidNamespace="7greens" projectId="7greens" />;
}
