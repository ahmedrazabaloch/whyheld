/**
 * Post-authentication redirect helpers.
 *
 * One place decides where a user lands after signing in, so the login form,
 * the route proxy and every marketing call-to-action agree.
 */

/** Where an authenticated user goes when no specific destination was asked for. */
export const DEFAULT_REDIRECT = "/dashboard";

/**
 * Narrows an untrusted `callbackUrl` to a safe in-app path.
 *
 * Rejects absolute URLs and protocol-relative / backslash forms so a crafted
 * link cannot bounce a freshly authenticated user to another origin.
 */
export function safeRedirectPath(
  raw: string | null | undefined,
  fallback: string = DEFAULT_REDIRECT,
): string {
  if (!raw) return fallback;
  const isInternal =
    raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/\\");
  return isInternal ? raw : fallback;
}

/**
 * Destination for a call-to-action that opens a signed-in feature.
 *
 * Authenticated visitors go straight there. Everyone else is sent to login
 * carrying the target as `callbackUrl`, so they land on the page they clicked
 * rather than a generic home screen. When `isAuthenticated` is unknown the
 * login route is used — the proxy forwards already-signed-in users through.
 */
export function featureHref(target: string, isAuthenticated?: boolean): string {
  if (isAuthenticated) return target;
  return `/login?callbackUrl=${encodeURIComponent(target)}`;
}
