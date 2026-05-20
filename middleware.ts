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

// Routes that require a signed-in Clerk session
const isProtected = createRouteMatcher(["/account(.*)", "/orders(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // No-op: Clerk keys absent — let every request through
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return NextResponse.next();
  }

  if (isProtected(req)) {
    await auth.protect();
  }
});

// Static matcher — must be compile-time constant for Next.js/Turbopack.
// The runtime key check above handles "Clerk not configured" gracefully.
export const config = {
  matcher: [
    // Skip Next.js internals and static asset files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
