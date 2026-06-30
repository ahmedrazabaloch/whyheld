
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyEmailSchema } from "@/lib/auth/validation";
import { consumeToken } from "@/lib/auth/tokens";

/**
 * POST /api/v1/auth/verify-email
 *
 * Validates a single-use verification token and stamps `User.emailVerified`.
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

  const parsed = verifyEmailSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION",
          message: "Missing verification token.",
        },
      },
      { status: 422 },
    );
  }

  const email = await consumeToken("verify-email", parsed.data.token);
  if (!email) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_TOKEN",
          message: "This verification link is invalid or has expired.",
        },
      },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  return NextResponse.json({ ok: true });
}
