"use client";

import type { ElementType, ReactNode } from "react";

/**
 * Thin local replacement for gad-visual-context's Identified component.
 * Renders `tag` (default "div") with data-cid for the DevPanel to discover.
 * `as` is a human-readable label (not an HTML element).
 */
export function Identified({
  as: _label,
  tag: Component = "div",
  cid,
  children,
  className,
  "data-cid": explicitCid,
  ...rest
}: {
  as?: string;
  tag?: ElementType;
  cid?: string;
  children: ReactNode;
  className?: string;
  [key: string]: unknown;
}) {
  const resolvedCid = explicitCid || cid || "";
  return (
    <Component data-cid={resolvedCid || undefined} className={className} {...rest}>
      {children}
    </Component>
  );
}
