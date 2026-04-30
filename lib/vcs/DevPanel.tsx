"use client";

import { useEffect, useState } from "react";

/**
 * Dev-only modal that lists every visible cid on the current page.
 * Toggle with Ctrl+. (or Cmd+. on macOS). Highlights elements on hover.
 */
export function DevPanel() {
  const [open, setOpen] = useState(false);
  const [cids, setCids] = useState<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === ".") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.setAttribute("data-vcs", "on");
    const found = Array.from(document.querySelectorAll<HTMLElement>("[data-cid]"))
      .map((el) => el.getAttribute("data-cid") || "")
      .filter(Boolean);
    setCids(Array.from(new Set(found)).sort());
    return () => {
      root.removeAttribute("data-vcs");
    };
  }, [open]);

  if (process.env.NODE_ENV === "production") return null;
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Visual Context inspector"
      className="fixed bottom-6 right-6 z-[9999] w-[360px] max-h-[60vh] overflow-auto rounded-2xl border border-black/15 bg-[var(--color-cream)] shadow-2xl backdrop-blur-md"
      style={{ boxShadow: "0 24px 60px rgba(28,26,20,0.18)" }}
    >
      <header className="flex items-center justify-between border-b border-black/10 px-4 py-3">
        <span className="font-display text-sm tracking-tight">Visual Context · {cids.length}</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs uppercase tracking-widest opacity-60 hover:opacity-100"
        >
          close · ⌃.
        </button>
      </header>
      <ul className="px-2 py-2 text-xs font-mono">
        {cids.map((c) => (
          <li
            key={c}
            className="cursor-pointer rounded px-2 py-1 hover:bg-[var(--color-cream-soft)]"
            onMouseEnter={() => highlight(c, true)}
            onMouseLeave={() => highlight(c, false)}
            onClick={() => {
              navigator.clipboard?.writeText(c);
            }}
            title="Click to copy"
          >
            {c}
          </li>
        ))}
      </ul>
      <footer className="border-t border-black/10 px-4 py-2 text-[10px] uppercase tracking-widest text-black/50">
        Hover to highlight · click to copy
      </footer>
    </div>
  );
}

function highlight(cidValue: string, on: boolean) {
  const el = document.querySelector<HTMLElement>(`[data-cid="${cidValue}"]`);
  if (!el) return;
  if (on) {
    el.style.outline = "2px solid var(--color-tomato)";
    el.style.outlineOffset = "4px";
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  } else {
    el.style.outline = "";
    el.style.outlineOffset = "";
  }
}
