import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create your account — Wayheld",
  description:
    "Join Wayheld and start planning slower, deeper, more intentional journeys.",
};

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Begin with Wayheld"
      title="Travel deeper, not faster."
      subtitle="Create your account in moments. We'll learn how you like to travel, then craft journeys around it."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-brand-btn-primary transition-colors hover:text-brand-btn-primary-hover"
          >
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
