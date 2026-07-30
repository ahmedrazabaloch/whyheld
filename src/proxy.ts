import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection middleware.
 *
 * Edge-safe: it checks only for the presence of a NextAuth session cookie (it
 * does not hit the database or run the full auth config, which uses Prisma).
 * Fine-grained checks (email verified, onboarding complete, ownership) happen
 * in server components / route handlers where the DB is available.
 *
 *  - Unauthenticated users hitting an app route → redirected to /login?callbackUrl
 *  - Authenticated users hitting an auth route (login/signup) → sent to /start
 */

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];

// App areas that require a session. (Dashboard etc. are built in later phases,
// but the guard is in place now per Phase 1 scope.)
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/journeys",
  "/saved",
  "/billing",
  "/settings",
  "/recommendations",
  "/profile",
];

/** NextAuth session cookie names (supports both NextAuth v4/v5 variants). */
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

function hasSession(request: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => request.cookies.has(name));
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authed = hasSession(request);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isProtected && !authed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && authed) {
    return NextResponse.redirect(new URL("/start", request.url));
  }

  return NextResponse.next();
}


export const config = {
  // Run on app routes; skip Next internals, API and static assets.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
