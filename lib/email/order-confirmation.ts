/**
 * Order confirmation email — renders HTML + text body and sends via Resend.
 *
 * Graceful degradation: when Resend is not configured, logs a warning and
 * returns `{ ok: false, skipped: true }`. Never throws. Never fails a payment.
 *
 * Task: UPAEC-T-272-09
 */

import { buildResendClient, resendFrom } from "./resend";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OrderConfirmationParams {
  to: string;
  itemName: string;
  amountCents: number;
  paymentId: string;
  receiptUrl?: string | null;
}

export interface SendConfirmationResult {
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

// ── HTML template ─────────────────────────────────────────────────────────────

function renderHtml(params: OrderConfirmationParams): string {
  const { itemName, amountCents, paymentId, receiptUrl } = params;
  const amount = formatDollars(amountCents);
  const receiptLink = receiptUrl
    ? `<p style="margin:16px 0"><a href="${receiptUrl}" style="color:#2d6a4f;font-weight:600">View your Square receipt →</a></p>`
    : "";

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
              <p style="margin:0 0 32px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Order Confirmation</p>

              <p style="margin:0 0 16px;font-size:16px;color:#374151">Thank you for your order! Your box is confirmed.</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;margin:24px 0">
                <tr style="background:#f3f4f6">
                  <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.04em">Order Summary</td>
                </tr>
                <tr>
                  <td style="padding:16px">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:15px;color:#111827;padding-bottom:8px"><strong>${itemName}</strong></td>
                        <td align="right" style="font-size:15px;color:#111827;padding-bottom:8px"><strong>${amount}</strong></td>
                      </tr>
                      <tr>
                        <td colspan="2" style="border-top:1px solid #e5e7eb;padding-top:8px;font-size:13px;color:#6b7280">Payment ID: ${paymentId}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${receiptLink}

              <p style="margin:24px 0 8px;font-size:14px;color:#6b7280">
                Questions? Reply to this email or contact us at
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

function renderText(params: OrderConfirmationParams): string {
  const { itemName, amountCents, paymentId, receiptUrl } = params;
  const amount = formatDollars(amountCents);
  const lines = [
    "7G Greens — Order Confirmation",
    "==============================",
    "",
    "Thank you for your order! Your box is confirmed.",
    "",
    `Item: ${itemName}`,
    `Amount: ${amount}`,
    `Payment ID: ${paymentId}`,
  ];
  if (receiptUrl) lines.push(`Receipt: ${receiptUrl}`);
  lines.push("", "Questions? Email hello@7greens.com", "", "7G Greens · Fresh from our farm to your table");
  return lines.join("\n");
}

// ── sendOrderConfirmation ─────────────────────────────────────────────────────

/**
 * Send an order confirmation email to the buyer.
 *
 * Returns `{ ok: true, emailId }` on success.
 * Returns `{ ok: false, skipped: true }` when Resend is not configured.
 * Returns `{ ok: false, error }` on send failure — caller MUST NOT surface
 * this as a payment failure. The Square charge already succeeded.
 */
export async function sendOrderConfirmation(
  params: OrderConfirmationParams
): Promise<SendConfirmationResult> {
  const resend = buildResendClient();

  if (!resend) {
    console.warn(
      "[upaec] Resend not configured — confirmation email NOT sent. " +
        "Set RESEND_API_KEY (and optionally RESEND_FROM) to enable email."
    );
    return { ok: false, skipped: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: resendFrom(),
      to: params.to,
      subject: `Your 7G Greens order is confirmed — ${params.itemName}`,
      html: renderHtml(params),
      text: renderText(params),
    });

    if (error) {
      console.warn("[upaec] Resend send failed:", error.message ?? String(error));
      return { ok: false, error: error.message ?? "resend_error" };
    }

    return { ok: true, emailId: data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[upaec] Resend send threw:", msg);
    return { ok: false, error: msg };
  }
}
