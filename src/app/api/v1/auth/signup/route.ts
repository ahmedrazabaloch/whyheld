// This route requires a database connection; skip static pre-rendering.
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { signupSchema } from "@/lib/auth/validation";
import { createToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/auth/email";

/**
 * POST /api/v1/auth/signup
 *
 * Creates a credentials user with a Profile and a CreditWallet (balance 0) in
 * a single transaction, then emails a verification link. Frontend then signs
 * the user in via the Credentials provider.
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

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION",
          message: "Please check the form.",
          fields: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 422 },
    );
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      {
        error: {
          code: "EMAIL_TAKEN",
          message: "An account with this email already exists.",
        },
      },
      { status: 409 },
    );
  }

  const [firstName, ...rest] = name.trim().split(/\s+/);
  const lastName = rest.join(" ") || null;
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      profile: {
        create: { firstName, lastName },
      },
      creditWallet: {
        create: { balance: 0 },
      },
    },
    select: { id: true, email: true },
  });

  // Fire verification email (non-fatal if it fails in dev).
  try {
    const token = await createToken("verify-email", normalizedEmail);
    await sendVerificationEmail(normalizedEmail, token);
  } catch {
    // Logged by the email stub; do not block signup.
  }

  return NextResponse.json({ user }, { status: 201 });
}
