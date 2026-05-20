/**
 * /orders — customer order history (Clerk-gated).
 *
 * Queries Supabase `orders` table by clerk_user_id (from Clerk auth).
 * Falls back gracefully when:
 *   - Clerk is not configured → auth-not-configured notice
 *   - Supabase is not configured → empty-state with explanation
 *   - No orders found → empty-state with store link
 *
 * Middleware (middleware.ts) redirects unauthenticated requests to /sign-in
 * before this page renders (when Clerk IS configured).
 *
 * VCS cids:
 *   orders.page           — page root
 *   orders.page.list      — order list
 *   orders.page.item.<id> — individual order row
 *   orders.page.empty     — empty state
 *
 * Design: Heritage Modern — cream/charcoal/sage palette.
 *
 * Task: UPAEC-T-272-13
 */

import type { Metadata } from "next";
import Link from "next/link";
import { PackageOpen, ArrowLeft, ExternalLink, ShoppingBag, AlertCircle } from "lucide-react";
import { cid } from "@/lib/vcs/cid";
import { buildSupabaseClient, supabaseConfigured } from "@/lib/supabase/client";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View your 7G Greens order history.",
};

// Always fresh — user expects live order data
export const dynamic = "force-dynamic";

const CLERK_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

// ── Types ─────────────────────────────────────────────────────────────────────

interface Order {
  id: string;
  payment_id: string;
  item_id: string;
  item_name: string;
  amount_cents: number;
  customer_email: string | null;
  receipt_url: string | null;
  status: string;
  created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function centsToDollars(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ── Data fetching ─────────────────────────────────────────────────────────────

async function fetchOrdersForUser(clerkUserId: string): Promise<Order[]> {
  const client = buildSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from("orders")
    .select("id, payment_id, item_id, item_name, amount_cents, customer_email, receipt_url, status, created_at")
    .eq("clerk_user_id", clerkUserId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.warn("[upaec] /orders Supabase query failed:", error.message);
    return [];
  }

  return (data ?? []) as Order[];
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function OrdersPage() {
  // ── Clerk not configured ────────────────────────────────────────────────────
  if (!CLERK_CONFIGURED) {
    return (
      <div
        data-cid={cid("orders.page")}
        className="grain-overlay mx-auto max-w-[var(--content-max)] px-[var(--section-px)] py-[var(--section-py)]"
      >
        <div className="mx-auto max-w-md text-center">
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: "var(--color-cream-soft)", border: "1px solid var(--color-border-strong)" }}
          >
            <PackageOpen size={28} className="text-[var(--color-charcoal-muted)]" aria-hidden />
          </div>
          <p className="eyebrow">Order history</p>
          <h1
            className="font-display mt-4 leading-tight text-[var(--color-charcoal)]"
            style={{ fontSize: "var(--text-display-sm)" }}
          >
            Sign in to view orders
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[var(--color-charcoal-soft)]">
            Customer authentication is not configured yet.
            Order history will be available once your account is set up.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/store" className="btn-primary">
              <ShoppingBag size={15} aria-hidden />
              Shop now
            </Link>
            <Link href="/" className="btn-secondary">
              Back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Clerk configured — get the session user ID ─────────────────────────────
  let userId: string | null = null;

  try {
    // Dynamic import to avoid build errors when @clerk/nextjs is present but
    // keys are set at runtime. auth() is a server function.
    const { auth } = await import("@clerk/nextjs/server");
    const session = await auth();
    userId = session?.userId ?? null;
  } catch (err) {
    console.warn("[upaec] /orders Clerk auth() failed:", err);
  }

  // If middleware didn't catch an unauthenticated user (edge case), redirect gracefully
  if (!userId) {
    return (
      <div
        data-cid={cid("orders.page")}
        className="grain-overlay mx-auto max-w-[var(--content-max)] px-[var(--section-px)] py-[var(--section-py)]"
      >
        <div className="mx-auto max-w-sm rounded-[28px] border border-[var(--color-border)] bg-[var(--color-cream)] p-10 text-center">
          <AlertCircle size={28} className="mx-auto mb-4 text-[var(--color-tan-deep)]" aria-hidden />
          <p className="font-display text-xl text-[var(--color-charcoal)]">Session required</p>
          <p className="mt-2 text-sm text-[var(--color-charcoal-muted)]">
            Please sign in to view your order history.
          </p>
          <Link href="/sign-in" className="btn-primary mt-6 inline-flex">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  // ── Fetch orders ────────────────────────────────────────────────────────────
  const orders = await fetchOrdersForUser(userId);
  const supConfigured = supabaseConfigured();

  return (
    <div
      data-cid={cid("orders.page")}
      className="grain-overlay mx-auto max-w-[var(--content-max)] px-[var(--section-px)] py-[var(--section-py)]"
    >
      {/* Header */}
      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-charcoal-muted)] hover:text-[var(--color-sage-deep)] transition-colors focus-visible:outline-2"
        aria-label="Back to account"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        My account
      </Link>

      <div className="mt-8 mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Order history</p>
          <h1
            className="font-display mt-3 leading-tight text-[var(--color-charcoal)]"
            style={{ fontSize: "var(--text-display-sm)", textWrap: "balance" } as React.CSSProperties}
          >
            Your orders
          </h1>
        </div>
        <Link
          href="/store"
          className="btn-secondary hidden sm:inline-flex"
          aria-label="Place a new order"
        >
          <ShoppingBag size={14} aria-hidden />
          New order
        </Link>
      </div>

      {/* Supabase not configured notice */}
      {!supConfigured && (
        <div
          role="status"
          aria-live="polite"
          className="mb-8 flex items-start gap-3 rounded-2xl border border-[var(--color-tan-deep)]/20 bg-[var(--color-tan)]/6 px-5 py-4"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-[var(--color-tan-deep)]" aria-hidden />
          <p className="text-sm text-[var(--color-tan-text)]">
            Order history requires Supabase to be configured.
            Set{" "}
            <code className="rounded bg-[var(--color-cream-soft)] px-1 py-0.5 font-mono text-[10px]">
              NEXT_PUBLIC_SUPABASE_URL
            </code>{" "}
            and{" "}
            <code className="rounded bg-[var(--color-cream-soft)] px-1 py-0.5 font-mono text-[10px]">
              SUPABASE_SERVICE_ROLE_KEY
            </code>{" "}
            in Vercel to enable this feature.
          </p>
        </div>
      )}

      {/* Empty state */}
      {orders.length === 0 ? (
        <div
          data-cid={cid("orders.page.empty")}
          className="rounded-[28px] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-cream-soft)] px-8 py-16 text-center"
        >
          <PackageOpen
            size={40}
            strokeWidth={1.2}
            className="mx-auto mb-4 text-[var(--color-charcoal-muted)]/40"
            aria-hidden
          />
          <p className="font-display text-xl text-[var(--color-charcoal)]">
            No orders yet
          </p>
          <p className="mt-2 text-sm text-[var(--color-charcoal-muted)]">
            {supConfigured
              ? "Your completed orders will appear here."
              : "Orders will appear here once Supabase is configured."}
          </p>
          <Link href="/store" className="btn-primary mt-8 inline-flex">
            <ShoppingBag size={14} aria-hidden />
            Browse the store
          </Link>
        </div>
      ) : (
        /* Order list */
        <ul
          data-cid={cid("orders.page.list")}
          className="flex flex-col gap-4"
          aria-label={`${orders.length} order${orders.length === 1 ? "" : "s"}`}
        >
          {orders.map((order) => (
            <li
              key={order.id}
              data-cid={cid(`orders.page.item.${order.id}`)}
              className="group flex flex-col gap-4 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-cream)] p-6 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Left — item info */}
              <div className="flex items-start gap-4">
                <div
                  className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "var(--color-sage-deep)" }}
                >
                  <PackageOpen size={18} className="text-[var(--color-cream)]" aria-hidden />
                </div>
                <div>
                  <p className="font-medium text-[var(--color-charcoal)]">
                    {order.item_name}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-charcoal-muted)]">
                    {formatDate(order.created_at)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-charcoal-muted)] font-mono">
                    #{order.payment_id.slice(0, 16)}
                  </p>
                </div>
              </div>

              {/* Right — price + status + receipt */}
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <span
                  className="font-display tabular-nums text-[var(--color-sage-deep)]"
                  style={{ fontSize: "clamp(1.25rem, 2vw, 1.5rem)" }}
                >
                  {centsToDollars(order.amount_cents)}
                </span>
                <span
                  className={[
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest",
                    order.status === "COMPLETED"
                      ? "bg-[var(--color-sage-deep)]/10 text-[var(--color-sage-deep)]"
                      : "bg-[var(--color-tan-deep)]/10 text-[var(--color-tan-deep)]",
                  ].join(" ")}
                >
                  {order.status}
                </span>
                {order.receipt_url && (
                  <a
                    href={order.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-sage-deep)] underline-offset-2 hover:underline"
                    aria-label={`View receipt for ${order.item_name}`}
                  >
                    <ExternalLink size={11} aria-hidden />
                    View receipt
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Mobile new-order CTA */}
      <div className="mt-10 flex sm:hidden">
        <Link href="/store" className="btn-primary w-full justify-center">
          <ShoppingBag size={15} aria-hidden />
          Place a new order
        </Link>
      </div>
    </div>
  );
}
