"use client";

/**
 * CheckoutForm — Square Web Payments SDK card tokenization form.
 *
 * Renders a Square-hosted card input iframe (tokenizes on-client, never
 * touches raw PAN server-side). On submit, sends `{ sourceId, ...item }`
 * to POST /api/checkout and handles the three outcomes:
 *   ① success — shows receipt
 *   ② not-configured — shows operator hint (no crash)
 *   ③ payment error — shows user-friendly message + retry
 *
 * VCS cids:
 *   checkout.form              — form root
 *   checkout.form.card         — Square card iframe mount
 *   checkout.form.submit       — submit button
 *   checkout.result.success    — success receipt block
 *   checkout.result.error      — error message block
 *   checkout.result.unconfigured — operator/sandbox hint block
 *
 * Design: Heritage Modern (cream/charcoal/sage/tan from globals.css).
 * Fraunces display + Plus Jakarta Sans body. No extra deps.
 *
 * Env vars consumed (client):
 *   NEXT_PUBLIC_SQUARE_APPLICATION_ID — Square app ID for Web Payments SDK
 *   NEXT_PUBLIC_SQUARE_LOCATION_ID    — Square location ID for the SDK
 *
 * Task: UPAEC-T-272-04
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { cid } from "@/lib/vcs/cid";
import { CheckCircle, AlertCircle, Loader2, Lock, ShieldCheck } from "lucide-react";

// ── Square Web Payments SDK types (global script, not npm) ─────────────────

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Square?: any;
  }
}

// ── Props ─────────────────────────────────────────────────────────────────

export interface CheckoutItem {
  id: string;
  name: string;
  priceDisplay: string;
  priceCents: number;
}

interface CheckoutFormProps {
  item: CheckoutItem;
  onCancel?: () => void;
  /**
   * Square Application ID for the Web Payments SDK.
   * Passed as a prop from the server component so checkout works whether
   * the Vercel env var is named NEXT_PUBLIC_SQUARE_APPLICATION_ID or
   * SQUARE_APPLICATION_ID (the wrong-prefix variant found in production).
   * Falls back to process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID when absent.
   */
  squareAppId?: string;
  /**
   * Square Location ID for the Web Payments SDK.
   * Same resilience pattern as squareAppId.
   */
  squareLocationId?: string;
  /**
   * "sandbox" | "production" — controls which Square CDN script loads.
   * Defaults to "sandbox" when absent.
   */
  squareEnvironment?: "sandbox" | "production";
}

// ── Status machine ────────────────────────────────────────────────────────

type Status =
  | { type: "idle" }
  | { type: "loading-sdk" }
  | { type: "sdk-ready" }
  | { type: "submitting" }
  | { type: "success"; paymentId: string; receiptUrl: string | null }
  | { type: "error"; message: string }
  | { type: "unconfigured" };

// ── Component ─────────────────────────────────────────────────────────────

export function CheckoutForm({
  item,
  onCancel,
  squareAppId,
  squareLocationId,
  squareEnvironment,
}: CheckoutFormProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cardInstanceRef = useRef<any>(null);
  const [status, setStatus] = useState<Status>({ type: "idle" });

  // Resolve from props first (server-passed — works with any Vercel var name),
  // then fall back to the NEXT_PUBLIC_ env vars (set correctly in .env.local).
  const appId = squareAppId ?? process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ?? "";
  const locationId = squareLocationId ?? process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? "";
  const sqEnv = squareEnvironment ?? (process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === "production" ? "production" : "sandbox");

  // ── Load Square Web Payments SDK ────────────────────────────────────────
  useEffect(() => {
    if (!appId || !locationId) {
      setStatus({ type: "unconfigured" });
      return;
    }

    setStatus({ type: "loading-sdk" });

    const scriptSrc =
      sqEnv === "production"
        ? "https://web.squarecdn.com/v1/square.js"
        : "https://sandbox.web.squarecdn.com/v1/square.js";

    // Avoid double-loading
    const existing = document.querySelector(`script[src="${scriptSrc}"]`);
    const boot = async () => {
      try {
        if (!window.Square) {
          throw new Error("Square SDK did not load");
        }
        const payments = window.Square.payments(appId, locationId);
        const card = await payments.card({
          style: {
            ".input-container": {
              borderColor: "rgba(28, 26, 20, 0.12)",
              borderRadius: "12px",
            },
            ".input-container.is-focus": {
              borderColor: "rgba(63, 88, 40, 0.5)",
              boxShadow: "0 0 0 2px rgba(63, 88, 40, 0.12)",
            },
            ".input-container.is-error": {
              borderColor: "rgba(162, 62, 42, 0.5)",
            },
            input: {
              color: "#1C1A14",
              fontFamily: "inherit",
              fontSize: "15px",
            },
            "input::placeholder": {
              color: "#5A5347",
            },
          },
        });
        await card.attach(cardRef.current!);
        cardInstanceRef.current = card;
        setStatus({ type: "sdk-ready" });
      } catch (err) {
        console.error("[checkout] Square SDK init failed:", err);
        setStatus({
          type: "error",
          message:
            "Could not load the payment form. Please refresh the page and try again.",
        });
      }
    };

    if (existing) {
      if (window.Square) {
        boot();
      } else {
        existing.addEventListener("load", boot);
      }
    } else {
      const script = document.createElement("script");
      script.src = scriptSrc;
      script.async = true;
      script.onload = boot;
      script.onerror = () => {
        setStatus({
          type: "error",
          message: "Payment library failed to load. Check your connection and try again.",
        });
      };
      document.head.appendChild(script);
    }

    return () => {
      if (cardInstanceRef.current) {
        cardInstanceRef.current.destroy().catch(() => {});
        cardInstanceRef.current = null;
      }
    };
  // Only run on mount — appId/locationId are env constants
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!cardInstanceRef.current) return;
      setStatus({ type: "submitting" });

      let sourceId: string;
      try {
        const result = await cardInstanceRef.current.tokenize();
        if (result.status !== "OK") {
          const msg =
            result.errors?.[0]?.message ??
            "Card tokenization failed. Please check your card details.";
          setStatus({ type: "error", message: msg });
          return;
        }
        sourceId = result.token;
      } catch (err) {
        setStatus({
          type: "error",
          message:
            err instanceof Error ? err.message : "Card tokenization failed.",
        });
        return;
      }

      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceId,
            itemId: item.id,
            itemName: item.name,
            amountCents: item.priceCents,
          }),
        });

        const data = await res.json();

        if (!data.ok) {
          if (data.configured === false) {
            setStatus({ type: "unconfigured" });
          } else {
            setStatus({
              type: "error",
              message: data.error ?? "Payment failed. Please try again.",
            });
          }
          return;
        }

        setStatus({
          type: "success",
          paymentId: data.paymentId,
          receiptUrl: data.receiptUrl ?? null,
        });
      } catch {
        setStatus({
          type: "error",
          message: "Network error. Please check your connection and try again.",
        });
      }
    },
    [item]
  );

  // ── Render ──────────────────────────────────────────────────────────────

  if (status.type === "success") {
    return (
      <div
        data-cid={cid("checkout.result.success")}
        className="flex flex-col items-center gap-6 py-10 text-center"
        role="status"
        aria-live="polite"
      >
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "var(--color-sage-deep)" }}
        >
          <CheckCircle size={30} className="text-[var(--color-cream)]" aria-hidden="true" />
        </div>
        <div>
          <h3
            className="font-display text-[var(--color-charcoal)]"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
          >
            Order received!
          </h3>
          <p className="mt-2 text-sm text-[var(--color-charcoal-soft)]">
            Your box is on its way. Check your email for delivery details.
          </p>
        </div>
        {status.receiptUrl && (
          <a
            href={status.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm"
          >
            View receipt →
          </a>
        )}
        <p className="text-[11px] tabular-nums text-[var(--color-charcoal-muted)]">
          Payment ID: {status.paymentId}
        </p>
      </div>
    );
  }

  if (status.type === "unconfigured") {
    return (
      <div
        data-cid={cid("checkout.result.unconfigured")}
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-cream-muted)] p-8 text-center"
      >
        <AlertCircle size={24} className="mx-auto mb-3 text-[var(--color-tan-deep)]" aria-hidden="true" />
        <p className="text-sm font-medium text-[var(--color-charcoal)]">
          Payments not configured
        </p>
        <p className="mt-2 text-xs leading-relaxed text-[var(--color-charcoal-muted)]">
          Set{" "}
          <code className="rounded bg-[var(--color-cream-soft)] px-1 py-0.5 font-mono text-[10px]">
            SQUARE_ACCESS_TOKEN
          </code>{" "}
          ·{" "}
          <code className="rounded bg-[var(--color-cream-soft)] px-1 py-0.5 font-mono text-[10px]">
            NEXT_PUBLIC_SQUARE_APPLICATION_ID
          </code>{" "}
          ·{" "}
          <code className="rounded bg-[var(--color-cream-soft)] px-1 py-0.5 font-mono text-[10px]">
            NEXT_PUBLIC_SQUARE_LOCATION_ID
          </code>{" "}
          in Vercel to enable checkout.
        </p>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="mt-5 text-sm font-medium text-[var(--color-sage-deep)] underline-offset-2 hover:underline"
          >
            ← Back to store
          </button>
        )}
      </div>
    );
  }

  const isProcessing = status.type === "submitting" || status.type === "loading-sdk";

  return (
    <form
      data-cid={cid("checkout.form")}
      onSubmit={handleSubmit}
      aria-label={`Purchase ${item.name}`}
      className="flex flex-col gap-6"
    >
      {/* Order summary */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-cream-soft)] px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow mb-1">Your order</p>
            <p className="text-base font-medium text-[var(--color-charcoal)]">
              {item.name}
            </p>
          </div>
          <span
            className="font-display tabular-nums text-[var(--color-sage-deep)]"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
          >
            {item.priceDisplay}
          </span>
        </div>
      </div>

      {/* Card input */}
      <div>
        <label
          id="card-label"
          className="mb-2 block text-sm font-medium text-[var(--color-charcoal)]"
        >
          Card details
        </label>

        {/* Square card iframe mounts here */}
        <div
          ref={cardRef}
          data-cid={cid("checkout.form.card")}
          aria-labelledby="card-label"
          className="min-h-[56px] rounded-[12px] border border-[var(--color-border)] bg-white"
          style={{
            // reserve space while SDK loads
            minHeight: status.type === "loading-sdk" ? "56px" : undefined,
          }}
        />

        {status.type === "loading-sdk" && (
          <div className="mt-3 flex items-center gap-2 text-xs text-[var(--color-charcoal-muted)]">
            <Loader2 size={12} className="animate-spin" aria-hidden="true" />
            <span>Loading secure payment form…</span>
          </div>
        )}
      </div>

      {/* Error message */}
      {status.type === "error" && (
        <div
          data-cid={cid("checkout.result.error")}
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-3 rounded-2xl border border-[var(--color-tomato-deep)]/20 bg-[var(--color-tomato-deep)]/5 px-5 py-4"
        >
          <AlertCircle
            size={16}
            className="mt-0.5 shrink-0 text-[var(--color-tomato)]"
            aria-hidden="true"
          />
          <p className="text-sm text-[var(--color-tomato-deep)]">{status.message}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          data-cid={cid("checkout.form.submit")}
          type="submit"
          disabled={isProcessing || status.type !== "sdk-ready"}
          aria-busy={status.type === "submitting"}
          className="btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minWidth: "180px" }}
        >
          {status.type === "submitting" ? (
            <>
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
              Processing…
            </>
          ) : (
            <>
              <Lock size={14} aria-hidden="true" />
              Pay {item.priceDisplay}
            </>
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="text-sm font-medium text-[var(--color-charcoal-muted)] hover:text-[var(--color-charcoal)] transition-colors disabled:opacity-40"
          >
            ← Cancel
          </button>
        )}
      </div>

      {/* Trust badge */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--color-charcoal-muted)]">
        <ShieldCheck size={12} aria-hidden="true" />
        <span>Secured by Square · Your card never touches our servers</span>
      </div>
    </form>
  );
}
