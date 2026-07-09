export function requireGoogleApiKey(): string {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    // In local dev without key, we might want a friendly warning rather than crashing entire server on boot, 
    // but the rule is to fail securely when it's accessed.
    throw new Error("GOOGLE_MAPS_API_KEY is not configured.");
  }
  return key;
}
