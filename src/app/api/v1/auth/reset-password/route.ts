
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { resetPasswordSchema } from "@/lib/auth/validation";
import { consumeToken } from "@/lib/auth/tokens";

/**
 * POST /api/v1/auth/reset-password
 *
 * Validates a single-use reset token, sets a new password hash, and (as a
 * convenience) marks the email verified. The token is consumed regardless of
 * outcome.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON." } },
      { status: 400 },
    );
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION",
          message: "Please choose a valid password.",
          fields: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 422 },
    );
  }

  const email = await consumeToken("reset-password", parsed.data.token);
  if (!email) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_TOKEN",
          message: "This reset link is invalid or has expired.",
        },
      },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, status: true },
  });
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_TOKEN",
          message: "This reset link is invalid or has expired.",
        },
      },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, emailVerified: new Date() },
  });

  return NextResponse.json({ ok: true });
}
