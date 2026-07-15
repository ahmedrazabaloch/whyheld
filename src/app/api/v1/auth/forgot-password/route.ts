
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/auth/validation";
import { createToken } from "@/lib/auth/tokens";
import { sendPasswordResetEmail } from "@/lib/auth/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/v1/auth/forgot-password
 *
 * Always returns `{ ok: true }` regardless of whether the email exists, to
 * avoid account enumeration. Only sends a reset link to real, credentials-based
 * accounts.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`forgot-password:${ip}`, { limit: 5, windowMs: 60000 });
  if (!success) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many password reset attempts. Please try again later." } },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON." } },
      { status: 400 },
    );
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION",
          message: "Enter a valid email address.",
          fields: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 422 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, status: true },
  });

  // Only send for active accounts that can actually use a password.
  if (user && user.passwordHash && user.status === "ACTIVE") {
    try {
      const token = await createToken("reset-password", email);
      await sendPasswordResetEmail(email, token);
    } catch {
      // Swallow — never reveal delivery state to the caller.
    }
  }

  return NextResponse.json({ ok: true });
}
