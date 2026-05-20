"use client";

/**
 * ZipChecker — homepage service-area checker widget.
 *
 * User enters their ZIP → hits /api/zip-check → shows:
 *   ✓ served: delivery day + cutoff time
 *   ✗ not served: encourages pickup option / contact
 *
 * VCS cids:
 *   home.zip-checker              — section root
 *   home.zip-checker.form         — input + submit
 *   home.zip-checker.result       — result banner
 *
 * Design: Heritage Modern — earthy cream/charcoal/sage palette.
 * Fraunces display, Plus Jakarta Sans body. No extra deps beyond fetch.
 *
 * Task: UPAEC-T-272-03
 */

import { useState, useRef, type FormEvent } from "react";
import { MapPin, ArrowRight, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cid } from "@/lib/vcs/cid";
import { useCartStore } from "@/lib/cart-store";

interface ZipCheckResult {
  served: boolean;
  area?: string;
  deliveryDay?: string;
  cutoffTime?: string;
  homeDelivery?: boolean;
  source?: string;
  error?: string;
}

type CheckState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "result"; result: ZipCheckResult }
  | { type: "error"; message: string };

export function ZipChecker() {
  const [zip, setZip] = useState("");
  const [state, setState] = useState<CheckState>({ type: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const setDeliveryZip = useCartStore((s) => s.setDeliveryZip);
  const setDeliveryMode = useCartStore((s) => s.setDeliveryMode);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = zip.trim().replace(/\D/g, "").slice(0, 5);
    if (trimmed.length !== 5) {
      inputRef.current?.focus();
      setState({ type: "error", message: "Please enter a 5-digit ZIP code." });
      return;
    }

    setState({ type: "loading" });
    try {
      const res = await fetch(`/api/zip-check?zip=${trimmed}`);
      const data: ZipCheckResult = await res.json();
      setState({ type: "result", result: data });

      if (data.served) {
        setDeliveryZip(trimmed);
        setDeliveryMode("delivery");
      }
    } catch {
      setState({
        type: "error",
        message: "Could not check your ZIP right now. Try again or call us.",
      });
    }
  }

  const isLoading = state.type === "loading";
  const result = state.type === "result" ? state.result : null;
  const inlineError = state.type === "error" ? state.message : null;

  return (
    <section
      data-cid={cid("home.zip-checker")}
      className="relative overflow-hidden bg-[var(--color-sage-deep)] py-[var(--section-py-tight)]"
      aria-label="Check if we deliver to your area"
    >
      {/* Background texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(250,246,238,0.5) 40px, rgba(250,246,238,0.5) 41px)",
        }}
      />

      <div className="relative mx-auto max-w-[var(--content-max)] px-[var(--section-px)]">
        <div className="flex flex-col items-start gap-10 md:flex-row md:items-center md:gap-16">

          {/* Text block */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[var(--color-tan)]" aria-hidden />
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-tan)]">
                Service area
              </p>
            </div>
            <h2
              className="font-display mt-3 leading-[1.02] text-[var(--color-cream)]"
              style={{ fontSize: "var(--text-display-sm)" }}
            >
              Do we deliver to you?
            </h2>
            <p className="mt-3 max-w-md text-base text-[var(--color-cream)]/70 leading-relaxed">
              We serve East Texas and DFW pickup points. Enter your ZIP to see delivery day and cutoff time.
            </p>
          </div>

          {/* Form block */}
          <div className="w-full md:w-auto md:min-w-[380px]">
            <form
              data-cid={cid("home.zip-checker.form")}
              onSubmit={handleSubmit}
              noValidate
              aria-label="ZIP code service check"
            >
              <div className="flex items-stretch gap-2">
                <label htmlFor="zip-input" className="sr-only">
                  Your ZIP code
                </label>
                <input
                  ref={inputRef}
                  id="zip-input"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{5}"
                  maxLength={5}
                  placeholder="Enter ZIP code"
                  value={zip}
                  onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  disabled={isLoading}
                  aria-invalid={!!inlineError}
                  aria-describedby={inlineError ? "zip-error" : undefined}
                  className={[
                    "flex-1 rounded-xl bg-[var(--color-cream)]/10 px-5 py-3.5 text-[var(--color-cream)]",
                    "placeholder-[var(--color-cream)]/40 text-base font-medium",
                    "border border-[var(--color-cream)]/20 outline-none",
                    "focus:border-[var(--color-cream)]/50 focus:ring-2 focus:ring-[var(--color-cream)]/20",
                    "disabled:opacity-50 transition-all",
                  ].join(" ")}
                />
                <button
                  type="submit"
                  disabled={isLoading || zip.length < 5}
                  aria-label="Check if we serve your ZIP"
                  className={[
                    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5",
                    "bg-[var(--color-tan)] text-[var(--color-soil)] font-semibold text-sm",
                    "hover:bg-[var(--color-tan-deep)] transition-colors",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                    "focus-visible:outline-2 focus-visible:outline-[var(--color-cream)]",
                  ].join(" ")}
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" aria-hidden />
                  ) : (
                    <ArrowRight size={18} aria-hidden />
                  )}
                  <span>{isLoading ? "Checking…" : "Check"}</span>
                </button>
              </div>

              {inlineError && (
                <p
                  id="zip-error"
                  role="alert"
                  className="mt-2 text-sm text-[var(--color-tan)]"
                >
                  {inlineError}
                </p>
              )}
            </form>

            {/* Result panel */}
            {result && (
              <div
                data-cid={cid("home.zip-checker.result")}
                role="status"
                aria-live="polite"
                className={[
                  "mt-4 rounded-xl border px-5 py-4",
                  result.served
                    ? "border-[var(--color-cream)]/20 bg-[var(--color-cream)]/10"
                    : "border-[var(--color-tomato)]/30 bg-[var(--color-tomato)]/10",
                ].join(" ")}
              >
                {result.served ? (
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-[var(--color-tan)]"
                      aria-hidden
                    />
                    <div>
                      <p className="font-semibold text-[var(--color-cream)]">
                        We deliver to {result.area}!
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-cream)]/75">
                        Next delivery:{" "}
                        <span className="font-medium text-[var(--color-cream)]">
                          {result.deliveryDay}
                        </span>
                        {" · "}Order by{" "}
                        <span className="font-medium text-[var(--color-cream)]">
                          {result.cutoffTime}
                        </span>
                      </p>
                      {result.homeDelivery ? (
                        <p className="mt-1 text-xs text-[var(--color-cream)]/60">
                          Home delivery available in your area.
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-[var(--color-cream)]/60">
                          Pickup-point delivery — we drop at a nearby location.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <XCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-[var(--color-tomato)]"
                      aria-hidden
                    />
                    <div>
                      <p className="font-semibold text-[var(--color-cream)]">
                        Not in our service area yet.
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-cream)]/70">
                        We&#39;re growing our routes. Call us at 817-501-0822 — we may still be
                        able to arrange a pickup point near you.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
