import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { signupSchema } from "@/lib/auth/validation";
import { createToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/auth/email";
import { resolvePlaceDetails } from "@/lib/location/service";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/v1/auth/signup
 *
 * Creates a credentials user with a Profile and a CreditWallet (balance 0) in
 * a single transaction, then emails a verification link. Frontend then signs
 * the user in via the Credentials provider.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`signup:${ip}`, { limit: 5, windowMs: 60000 });
  if (!success) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many signup attempts. Please try again later." } },
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

  const { name, email, password, placeId } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      passwordHash: true,
      accounts: { select: { provider: true } },
    },
  });
  if (existing) {
    // If the account was created via a social provider and has no password,
    // signing up with credentials can never work — steer them to that provider.
    const oauthOnly =
      !existing.passwordHash && existing.accounts.length > 0;
    const providers = existing.accounts.map((a) => a.provider);
    return NextResponse.json(
      {
        error: {
          code: oauthOnly ? "OAUTH_ACCOUNT" : "EMAIL_TAKEN",
          message: oauthOnly
            ? `This email is registered with ${formatProviders(providers)}. Please sign in with ${formatProviders(providers)} instead.`
            : "An account with this email already exists.",
          providers,
        },
      },
      { status: 409 },
    );
  }

  const [firstName, ...rest] = name.trim().split(/\s+/);
  const lastName = rest.join(" ") || null;
  const passwordHash = await hashPassword(password);

  let locationData = undefined;
  if (placeId) {
    const resolved = await resolvePlaceDetails(placeId);
    if (resolved) {
      locationData = {
        city: resolved.city,
        state: resolved.state,
        country: resolved.country,
        countryCode: resolved.countryCode,
        formattedAddress: resolved.formattedAddress,
        latitude: resolved.latitude,
        longitude: resolved.longitude,
        locationPlaceId: resolved.placeId,
        locationUpdatedAt: new Date(),
      };
    }
  }

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      profile: {
        create: { 
          firstName, 
          lastName,
          ...locationData 
        },
      },
      creditWallet: {
        create: {
          balance: 5,
          lifetimeGranted: 5,
          transactions: {
            create: {
              type: "GRANT",
              amount: 5,
              balanceAfter: 5,
              reason: "SIGNUP_BONUS",
              user: {
                connect: {
                  email: normalizedEmail,
                },
              },
            },
          },
        },
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

/** Turns provider enum values (e.g. "GOOGLE") into readable, joined labels. */
function formatProviders(providers: string[]): string {
  const labels = providers.map(
    (p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase(),
  );
  if (labels.length <= 1) return labels[0] ?? "another provider";
  return `${labels.slice(0, -1).join(", ")} or ${labels[labels.length - 1]}`;
}
