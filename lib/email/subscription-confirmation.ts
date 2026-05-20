/**
 * Subscription confirmation email — renders HTML + text body and sends via Resend.
 *
 * Graceful degradation: when Resend is not configured, logs a warning and
 * returns `{ ok: false, skipped: true }`. Never throws. Never fails a subscription.
 *
 * Task: UPAEC-T-272-05
 */

import { buildResendClient, resendFrom } from "./resend";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SubscriptionConfirmationParams {
  to: string;
  customerName?: string | null;
  planName: string;
  cadence: string;
  amountCents: number;
  subscriptionId: string;
}

export interface SendSubscriptionConfirmationResult {
  ok: boolean;
  /** True when skipped due to missing config — not an error. */
  skipped?: boolean;
  emailId?: string;
  error?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function cadenceLabel(cadence: string): string {
  switch (cadence.toUpperCase()) {
    case "WEEKLY":
      return "week";
    case "MONTHLY":
      return "month";
    case "QUARTERLY":
      return "quarter";
    case "ANNUAL":
      return "year";
    default:
      return cadence.toLowerCase();
  }
}

// ── HTML template ─────────────────────────────────────────────────────────────

function renderHtml(params: SubscriptionConfirmationParams): string {
  const { customerName, planName, cadence, amountCents, subscriptionId } = params;
  const amount = formatDollars(amountCents);
  const per = cadenceLabel(cadence);
  const greeting = customerName ? `Hi ${customerName.split(" ")[0]},` : "Hello,";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:system-ui,-apple-system,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:40px;max-width:560px">
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:28px;font-weight:700;color:#1a1a1a">7G Greens</p>
              <p style="margin:0 0 32px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Subscription Confirmed</p>

              <p style="margin:0 0 16px;font-size:16px;color:#374151">${greeting}</p>
              <p style="margin:0 0 16px;font-size:16px;color:#374151">
                Your <strong>${planName}</strong> subscription is confirmed. Fresh produce will be on its way to you every ${per}.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;margin:24px 0">
                <tr style="background:#f3f4f6">
                  <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.04em">Subscription Summary</td>
                </tr>
                <tr>
                  <td style="padding:16px">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:15px;color:#111827;padding-bottom:8px"><strong>${planName}</strong></td>
                        <td align="right" style="font-size:15px;color:#111827;padding-bottom:8px"><strong>${amount}/${per}</strong></td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;color:#6b7280;padding-bottom:4px">Cadence</td>
                        <td align="right" style="font-size:13px;color:#6b7280;padding-bottom:4px">${cadence.charAt(0) + cadence.slice(1).toLowerCase()}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="border-top:1px solid #e5e7eb;padding-top:8px;font-size:13px;color:#6b7280">
                          Subscription ID: ${subscriptionId}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 8px;font-size:14px;color:#374151">
                Your card on file will be charged automatically. To manage or cancel your subscription, reply to this email or contact us at
                <a href="mailto:hello@7greens.com" style="color:#2d6a4f">hello@7greens.com</a>.
              </p>

              <p style="margin:32px 0 0;font-size:13px;color:#9ca3af">7G Greens · Fresh from our farm to your table</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Plain text fallback ────────────────────────────────────────────────────────

function renderText(params: SubscriptionConfirmationParams): string {
  const { customerName, planName, cadence, amountCents, subscriptionId } = params;
  const amount = formatDollars(amountCents);
  const per = cadenceLabel(cadence);
  const greeting = customerName ? `Hi ${customerName.split(" ")[0]},` : "Hello,";

  return [
    "7G Greens — Subscription Confirmed",
    "===================================",
    "",
    greeting,
    "",
    `Your ${planName} subscription is confirmed.`,
    `You will be charged ${amount} every ${per}.`,
    "",
    `Plan: ${planName}`,
    `Cadence: ${cadence.charAt(0) + cadence.slice(1).toLowerCase()}`,
    `Amount: ${amount}/${per}`,
    `Subscription ID: ${subscriptionId}`,
    "",
    "To manage or cancel your subscription, email hello@7greens.com.",
    "",
    "7G Greens · Fresh from our farm to your table",
  ].join("\n");
}

// ── sendSubscriptionConfirmation ──────────────────────────────────────────────

/**
 * Send a subscription confirmation email to the subscriber.
 *
 * Returns `{ ok: true, emailId }` on success.
 * Returns `{ ok: false, skipped: true }` when Resend is not configured.
 * Returns `{ ok: false, error }` on send failure — caller MUST NOT surface
 * this as a subscription failure. The Square subscription already exists.
 */
export async function sendSubscriptionConfirmation(
  params: SubscriptionConfirmationParams
): Promise<SendSubscriptionConfirmationResult> {
  const resend = buildResendClient();

  if (!resend) {
    console.warn(
      "[upaec] Resend not configured — subscription confirmation email NOT sent. " +
        "Set RESEND_API_KEY (and optionally RESEND_FROM) to enable email."
    );
    return { ok: false, skipped: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: resendFrom(),
      to: params.to,
      subject: `Your 7G Greens ${params.planName} subscription is confirmed`,
      html: renderHtml(params),
      text: renderText(params),
    });

    if (error) {
      console.warn("[upaec] Resend subscription send failed:", error.message ?? String(error));
      return { ok: false, error: error.message ?? "resend_error" };
    }

    return { ok: true, emailId: data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[upaec] Resend subscription send threw:", msg);
    return { ok: false, error: msg };
  }
}
