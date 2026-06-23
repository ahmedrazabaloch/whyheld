/**
 * Transactional email sender (Phase 1 stub).
 *
 * No email provider is wired yet. In development we log the link to the server
 * console so the verification / reset flows are fully testable end-to-end.
 * Swap `deliver()` for a real provider (Resend/SES/Postmark) later without
 * touching call sites.
 */

interface EmailMessage {
  to: string;
  subject: string;
  /** Plaintext body (links included). */
  text: string;
}

async function deliver(message: EmailMessage): Promise<void> {
  // TODO(Phase 8): integrate a real email provider.
  if (process.env.NODE_ENV !== "production") {
    console.info(
      `\n[email:dev] → ${message.to}\n  subject: ${message.subject}\n  ${message.text}\n`,
    );
  }
}

function appUrl(path: string): string {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}

export async function sendVerificationEmail(
  to: string,
  rawToken: string,
): Promise<void> {
  const link = appUrl(`/verify-email?token=${encodeURIComponent(rawToken)}`);
  await deliver({
    to,
    subject: "Confirm your Wayheld email",
    text: `Welcome to Wayheld. Confirm your email to begin:\n${link}\n\nThis link expires in 24 hours.`,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  rawToken: string,
): Promise<void> {
  const link = appUrl(`/reset-password?token=${encodeURIComponent(rawToken)}`);
  await deliver({
    to,
    subject: "Reset your Wayheld password",
    text: `We received a request to reset your password:\n${link}\n\nThis link expires in 1 hour. If you didn't ask for this, you can ignore it.`,
  });
}
