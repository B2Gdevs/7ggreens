/**
 * Resend client factory.
 *
 * Used server-side only. Returns null when RESEND_API_KEY is absent so
 * callers can degrade gracefully (skip email, log, succeed).
 *
 * Env vars:
 *   RESEND_API_KEY   — required for sending
 *   RESEND_FROM      — from address (default: orders@upaec.com)
 *
 * Task: UPAEC-T-272-09
 */

import { Resend } from "resend";

/** Build a Resend client. Returns null when RESEND_API_KEY is absent. */
export function buildResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

/** Returns true when Resend is configured. */
export function resendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/** The from address to use for outgoing emails. */
export function resendFrom(): string {
  return process.env.RESEND_FROM ?? "orders@upaec.com";
}
