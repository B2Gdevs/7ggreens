"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Visual Context inspector modal - always available in production.
 *
 * Toggle: Alt+I (works on macOS + Windows + Linux). Lists every visible
 * cid on the current page, highlights elements on hover, and exposes
 * copyable quick prompts for AI handoff.
 */
export function DevPanel() {
  const [open, setOpen] = useState(false);
  const [cids, setCids] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "i" || e.key === "I" || e.code === "KeyI")) {
        e.preventDefault();
        setOpen((value) => !value);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(null), 1400);
    return () => window.clearTimeout(timeout);
  }, [copied]);

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

  const filteredCids = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return cids;
    return cids.filter((value) => value.toLowerCase().includes(normalizedQuery));
  }, [cids, query]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Visual Context inspector"
      className="fixed bottom-6 right-6 z-[9999] w-[400px] max-h-[72vh] overflow-hidden rounded-2xl border border-black/15 bg-[var(--color-cream)] shadow-2xl backdrop-blur-md"
      style={{ boxShadow: "0 24px 60px rgba(28,26,20,0.18)" }}
    >
      <header className="flex items-center justify-between border-b border-black/10 px-4 py-3">
        <span className="font-display text-sm tracking-tight">Visual Context - {filteredCids.length}</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs uppercase tracking-widest opacity-60 hover:opacity-100"
        >
          close - alt+i
        </button>
      </header>

      <div className="border-b border-black/8 px-4 py-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search cids"
          className="w-full rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm text-[var(--color-charcoal)] outline-none transition focus:border-[var(--color-sage)] focus:ring-2 focus:ring-[var(--color-sage)]/20"
        />
      </div>

      <ul className="max-h-[calc(72vh-8.5rem)] overflow-y-auto px-3 py-3 text-xs font-mono">
        {filteredCids.map((value) => (
          <li
            key={value}
            className="mb-2 rounded-2xl border border-black/8 bg-white/55 p-3 transition hover:bg-[var(--color-cream-soft)]"
            onMouseEnter={() => highlight(value, true)}
            onMouseLeave={() => highlight(value, false)}
          >
            <button
              type="button"
              className="w-full cursor-pointer text-left text-[var(--color-charcoal)]"
              onClick={() => void copyText(value, setCopied)}
              title="Click to copy cid"
            >
              {value}
            </button>

            <div className="mt-3 flex flex-wrap gap-2">
              <PromptChip
                label="Edit"
                onClick={() => void copyText(`Modify the ${value} section to: [your change]`, setCopied, `${value}:edit`)}
              />
              <PromptChip
                label="Ask"
                onClick={() => void copyText(`Explain how the ${value} section works and where it's defined.`, setCopied, `${value}:ask`)}
              />
              <PromptChip
                label="Move"
                onClick={() => void copyText(`Move/restructure the ${value} section so that: [your goal]`, setCopied, `${value}:move`)}
              />
            </div>

            {copied?.startsWith(`${value}:`) ? (
              <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[var(--color-sage-deep)]">
                copied
              </p>
            ) : null}
          </li>
        ))}

        {filteredCids.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-black/10 px-4 py-6 text-center text-[11px] uppercase tracking-[0.18em] text-black/45">
            No matching cid
          </li>
        ) : null}
      </ul>

      <footer className="border-t border-black/10 px-4 py-2 text-[10px] uppercase tracking-widest text-black/50">
        hover to highlight - click cid to copy - use quick prompts - alt+i to toggle - esc to close
      </footer>
    </div>
  );
}

function PromptChip({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-black/10 bg-[var(--color-cream)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-charcoal-soft)] transition hover:border-[var(--color-sage)] hover:text-[var(--color-sage-deep)]"
    >
      {label}
    </button>
  );
}

async function copyText(
  value: string,
  setCopied: (value: string | null) => void,
  copiedKey = value,
) {
  try {
    await navigator.clipboard.writeText(value);
    setCopied(copiedKey);
  } catch {
    setCopied(null);
  }
}

function highlight(cidValue: string, on: boolean) {
  const el = document.querySelector<HTMLElement>(`[data-cid="${cidValue}"]`);
  if (!el) return;
  if (on) {
    el.style.outline = "2px solid var(--color-tomato)";
    el.style.outlineOffset = "4px";
    // Only scroll if the element is fully off-screen — never when partially
    // visible (was causing the page to lurch around on every hover).
    const rect = el.getBoundingClientRect();
    const fullyOff =
      rect.bottom < 0 || rect.top > window.innerHeight;
    if (fullyOff) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  } else {
    el.style.outline = "";
    el.style.outlineOffset = "";
  }
}
