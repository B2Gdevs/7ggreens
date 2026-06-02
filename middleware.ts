/**
 * UPAEC Next.js middleware.
 *
 * When Clerk is configured (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY set):
 *   - Protected routes: /account, /orders (customer-only areas)
 *   - Public routes: everything else — store still works without auth
 *
 * When Clerk is NOT configured:
 *   - Middleware is a no-op passthrough (early return when keys absent)
 *
 * Graceful degradation: the store checkout, subscriptions, and browse all work
 * without a Clerk session. Auth is additive — it enriches the experience but
 * doesn't gate purchases.
 *
 * Task: UPAEC-T-272-06
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// IMPORTANT: `clerkMiddleware()` validates the publishable key when it runs on
// each request and throws "Missing publishableKey" BEFORE any callback guard.
// So the no-key branch must avoid calling clerkMiddleware ENTIRELY — we export
// a plain passthrough instead. The store/checkout/Square paths need no auth;
// auth is additive (only /account and /orders use it when Clerk is configured).
const CLERK_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Routes that require a signed-in Clerk session (only enforced when configured).
const isProtected = createRouteMatcher(["/account(.*)", "/orders(.*)"]);

const passthrough = (_req: NextRequest) => NextResponse.next();

export default CLERK_KEY
  ? clerkMiddleware(async (auth, req: NextRequest) => {
      if (isProtected(req)) {
        await auth.protect();
      }
    })
  : passthrough;

// Static matcher — must be compile-time constant for Next.js/Turbopack.
// The runtime key check above handles "Clerk not configured" gracefully.
export const config = {
  matcher: [
    // Skip Next.js internals and static asset files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
