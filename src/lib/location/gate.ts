/**
 * Location-based feature gates.
 * Always evaluate on the server; never trust a client-supplied countryCode.
 */

export function isUsUser(
  profile: { countryCode?: string | null } | null | undefined,
): boolean {
  return profile?.countryCode?.toUpperCase() === "US";
}
