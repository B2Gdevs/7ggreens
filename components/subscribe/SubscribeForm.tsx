"use client";

/**
 * SubscribeForm — Square Web Payments card tokenization + subscription creation.
 *
 * Flow:
 *   1. Customer selects a plan (weekly / monthly)
 *   2. Enters name, email, optional phone
 *   3. Card is tokenized via Square Web Payments SDK (iframe; PAN never touches server)
 *   4. POST /api/subscribe → customer → card-on-file → Square Subscription
 *   5. Success screen with subscription ID
 *
 * VCS cids:
 *   subscribe.form                  — form root
 *   subscribe.form.plan-<id>        — plan radio option
 *   subscribe.form.card             — Square card iframe mount
 *   subscribe.form.submit           — subscribe button
 *   subscribe.result.success        — success confirmation block
 *   subscribe.result.error          — error message block
 *   subscribe.result.unconfigured   — operator/sandbox hint block
 *
 * Design: Heritage Modern (cream/charcoal/sage from globals.css).
 * Fraunces display + Plus Jakarta Sans body. No extra deps.
 *
 * Env vars consumed (client):
 *   NEXT_PUBLIC_SQUARE_APPLICATION_ID — Square app ID for Web Payments SDK
 *   NEXT_PUBLIC_SQUARE_LOCATION_ID    — Square location ID for the SDK
 *
 * Task: UPAEC-T-272-05
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { cid } from "@/lib/vcs/cid";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

// ── Square Web Payments SDK types (global script, not npm) ────────────────────

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Square?: any;
  }
}

// ── Plan shape (mirrors lib/square/subscriptions.ts SubscriptionPlan) ────────

export interface SubscriptionPlanOption {
  id: string;
  name: string;
  cadence: string;
  priceCents: number;
  priceDisplay: string;
  variationId: string;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface SubscribeFormProps {
  plans: SubscriptionPlanOption[];
  plansConfigured: boolean;
  onCancel?: () => void;
  /**
   * Square Application ID — passed as prop from server component so checkout
   * works whether Vercel has NEXT_PUBLIC_SQUARE_APPLICATION_ID or SQUARE_APPLICATION_ID.
   */
  squareAppId?: string;
  /** Square Location ID — same resilience pattern as squareAppId */
  squareLocationId?: string;
  /** "sandbox" | "production" — controls which Square CDN script loads */
  squareEnvironment?: "sandbox" | "production";
}

// ── Status machine ────────────────────────────────────────────────────────────

type Status =
  | { type: "idle" }
  | { type: "loading-sdk" }
  | { type: "sdk-ready" }
  | { type: "submitting" }
  | { type: "success"; subscriptionId: string; planName: string }
  | { type: "error"; message: string }
  | { type: "unconfigured" };

// ── Component ─────────────────────────────────────────────────────────────────

export function SubscribeForm({
  plans,
  plansConfigured,
  onCancel,
  squareAppId,
  squareLocationId,
  squareEnvironment,
}: SubscribeFormProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cardInstanceRef = useRef<any>(null);

  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Resolve from props first (server-passed — works with any Vercel var name),
  // then fall back to the NEXT_PUBLIC_ env vars (set correctly in .env.local).
  const appId = squareAppId ?? process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ?? "";
  const locationId = squareLocationId ?? process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? "";
  const sqEnv = squareEnvironment ?? (process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === "production" ? "production" : "sandbox");

  const selectedPlan = plans[selectedPlanIndex] ?? plans[0];

  // ── Load Square Web Payments SDK ──────────────────────────────────────────
  useEffect(() => {
    if (!appId || !locationId || !plansConfigured) {
      setStatus({ type: "unconfigured" });
      return;
    }

    setStatus({ type: "loading-sdk" });

    const scriptSrc =
      sqEnv === "production"
        ? "https://web.squarecdn.com/v1/square.js"
        : "https://sandbox.web.squarecdn.com/v1/square.js";

    const boot = async () => {
      try {
        if (!window.Square) throw new Error("Square SDK did not load");

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
            input: { color: "#1C1A14", fontFamily: "inherit", fontSize: "15px" },
            "input::placeholder": { color: "#5A5347" },
          },
        });

        await card.attach(cardRef.current!);
        cardInstanceRef.current = card;
        setStatus({ type: "sdk-ready" });
      } catch (err) {
        console.error("[subscribe] Square SDK init failed:", err);
        setStatus({
          type: "error",
          message: "Could not load the payment form. Please refresh and try again.",
        });
      }
    };

    const existing = document.querySelector(`script[src="${scriptSrc}"]`);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!cardInstanceRef.current) return;
      if (!customerEmail.trim()) {
        setStatus({ type: "error", message: "Email address is required." });
        return;
      }

      setStatus({ type: "submitting" });

      // 1. Tokenize card
      let sourceId: string;
      try {
        const result = await cardInstanceRef.current.tokenize();
        if (result.status !== "OK") {
          const msg =
            result.errors?.[0]?.message ?? "Card tokenization failed. Please check your card details.";
          setStatus({ type: "error", message: msg });
          return;
        }
        sourceId = result.token;
      } catch (err) {
        setStatus({
          type: "error",
          message: err instanceof Error ? err.message : "Card tokenization failed.",
        });
        return;
      }

      // 2. POST to /api/subscribe
      try {
        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceId,
            planVariationId: selectedPlan.variationId,
            planName: selectedPlan.name,
            cadence: selectedPlan.cadence,
            amountCents: selectedPlan.priceCents,
            customerEmail: customerEmail.trim(),
            customerName: customerName.trim() || undefined,
            customerPhone: customerPhone.trim() || undefined,
          }),
        });

        const data = await res.json();

        if (!data.ok) {
          if (data.configured === false) {
            setStatus({ type: "unconfigured" });
          } else {
            setStatus({
              type: "error",
              message: data.error ?? "Subscription failed. Please try again.",
            });
          }
          return;
        }

        setStatus({
          type: "success",
          subscriptionId: data.subscriptionId,
          planName: selectedPlan.name,
        });
      } catch {
        setStatus({
          type: "error",
          message: "Network error. Please check your connection and try again.",
        });
      }
    },
    [selectedPlan, customerEmail, customerName, customerPhone]
  );

  // ── Success ───────────────────────────────────────────────────────────────
  if (status.type === "success") {
    return (
      <div
        data-cid={cid("subscribe.result.success")}
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
            You're subscribed!
          </h3>
          <p className="mt-2 text-sm text-[var(--color-charcoal-soft)]">
            Your <strong>{status.planName}</strong> begins this cycle. Check your email for details.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-[var(--color-cream-soft)] px-4 py-2">
          <RefreshCw size={12} className="text-[var(--color-sage-deep)]" aria-hidden="true" />
          <span className="text-[11px] text-[var(--color-charcoal-muted)]">
            Subscription ID: {status.subscriptionId}
          </span>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-[var(--color-sage-deep)] underline-offset-2 hover:underline"
          >
            ← Back to store
          </button>
        )}
      </div>
    );
  }

  // ── Unconfigured ──────────────────────────────────────────────────────────
  if (status.type === "unconfigured") {
    return (
      <div
        data-cid={cid("subscribe.result.unconfigured")}
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-cream-muted)] p-8 text-center"
      >
        <AlertCircle size={24} className="mx-auto mb-3 text-[var(--color-tan-deep)]" aria-hidden="true" />
        <p className="text-sm font-medium text-[var(--color-charcoal)]">
          Subscriptions not configured
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
          in Vercel to enable subscriptions.
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
      data-cid={cid("subscribe.form")}
      onSubmit={handleSubmit}
      aria-label="Subscribe to a recurring box"
      className="flex flex-col gap-6"
    >
      {/* Plan selector */}
      <fieldset>
        <legend className="mb-3 text-sm font-medium text-[var(--color-charcoal)]">
          Choose your plan
        </legend>
        <div className="flex flex-col gap-3">
          {plans.map((plan, i) => (
            <label
              key={plan.variationId}
              data-cid={cid(`subscribe.form.plan-${plan.id}`)}
              className={[
                "flex cursor-pointer items-center justify-between rounded-2xl border px-5 py-4 transition-colors",
                selectedPlanIndex === i
                  ? "border-[var(--color-sage-deep)] bg-[var(--color-sage-deep)]/5"
                  : "border-[var(--color-border)] bg-[var(--color-cream-soft)] hover:border-[var(--color-sage-deep)]/40",
              ].join(" ")}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="plan"
                  value={i}
                  checked={selectedPlanIndex === i}
                  onChange={() => setSelectedPlanIndex(i)}
                  className="accent-[var(--color-sage-deep)]"
                  aria-label={plan.name}
                />
                <div>
                  <span className="block text-sm font-medium text-[var(--color-charcoal)]">
                    {plan.name}
                  </span>
                  <span className="block text-[11px] text-[var(--color-charcoal-muted)]">
                    {plan.cadence.charAt(0) + plan.cadence.slice(1).toLowerCase()} delivery
                  </span>
                </div>
              </div>
              <span
                className="font-display tabular-nums text-[var(--color-sage-deep)]"
                style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)" }}
              >
                {plan.priceDisplay}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Contact fields */}
      <div className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="sub-email"
            className="mb-1.5 block text-sm font-medium text-[var(--color-charcoal)]"
          >
            Email <span aria-hidden="true" className="text-[var(--color-tomato)]">*</span>
          </label>
          <input
            id="sub-email"
            type="email"
            autoComplete="email"
            required
            value={customerEmail}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomerEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-[12px] border border-[var(--color-border)] bg-white px-4 py-3 text-[15px] text-[var(--color-charcoal)] placeholder:text-[var(--color-charcoal-muted)] focus:border-[var(--color-sage-deep)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sage-deep)]/12 transition-colors"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="sub-name"
              className="mb-1.5 block text-sm font-medium text-[var(--color-charcoal)]"
            >
              Name <span className="text-[var(--color-charcoal-muted)] font-normal">(optional)</span>
            </label>
            <input
              id="sub-name"
              type="text"
              autoComplete="name"
              value={customerName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full rounded-[12px] border border-[var(--color-border)] bg-white px-4 py-3 text-[15px] text-[var(--color-charcoal)] placeholder:text-[var(--color-charcoal-muted)] focus:border-[var(--color-sage-deep)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sage-deep)]/12 transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="sub-phone"
              className="mb-1.5 block text-sm font-medium text-[var(--color-charcoal)]"
            >
              Phone <span className="text-[var(--color-charcoal-muted)] font-normal">(optional)</span>
            </label>
            <input
              id="sub-phone"
              type="tel"
              autoComplete="tel"
              value={customerPhone}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomerPhone(e.target.value)}
              placeholder="(555) 000-0000"
              className="w-full rounded-[12px] border border-[var(--color-border)] bg-white px-4 py-3 text-[15px] text-[var(--color-charcoal)] placeholder:text-[var(--color-charcoal-muted)] focus:border-[var(--color-sage-deep)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sage-deep)]/12 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Card input */}
      <div>
        <label
          id="sub-card-label"
          className="mb-2 block text-sm font-medium text-[var(--color-charcoal)]"
        >
          Card details
        </label>

        <div
          ref={cardRef}
          data-cid={cid("subscribe.form.card")}
          aria-labelledby="sub-card-label"
          className="min-h-[56px] rounded-[12px] border border-[var(--color-border)] bg-white"
          style={{ minHeight: status.type === "loading-sdk" ? "56px" : undefined }}
        />

        {status.type === "loading-sdk" && (
          <div className="mt-3 flex items-center gap-2 text-xs text-[var(--color-charcoal-muted)]">
            <Loader2 size={12} className="animate-spin" aria-hidden="true" />
            <span>Loading secure payment form…</span>
          </div>
        )}
      </div>

      {/* Billing notice */}
      {selectedPlan && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-cream-soft)] px-5 py-4 text-xs text-[var(--color-charcoal-muted)]">
          Your card will be charged{" "}
          <strong className="text-[var(--color-charcoal)]">{selectedPlan.priceDisplay}</strong>{" "}
          automatically each {selectedPlan.cadence.toLowerCase()} until you cancel. Reply to your
          confirmation email to manage or cancel at any time.
        </div>
      )}

      {/* Error message */}
      {status.type === "error" && (
        <div
          data-cid={cid("subscribe.result.error")}
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
          data-cid={cid("subscribe.form.submit")}
          type="submit"
          disabled={isProcessing || status.type !== "sdk-ready"}
          aria-busy={status.type === "submitting"}
          className="btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minWidth: "200px" }}
        >
          {status.type === "submitting" ? (
            <>
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
              Subscribing…
            </>
          ) : (
            <>
              <Lock size={14} aria-hidden="true" />
              Subscribe — {selectedPlan?.priceDisplay ?? "—"}
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
