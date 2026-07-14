export function getPlanCreditLimit(plan: string): number | "unlimited" {
  if (plan === "PREMIUM") {
    return "unlimited";
  }
  // Free / Per_Journey plans default to 5
  return 5;
}
