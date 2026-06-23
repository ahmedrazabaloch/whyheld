import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in — Wayheld",
  description: "Sign in to your Wayheld account and continue travelling deeper.",
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Continue your journey."
      subtitle="Sign in to pick up where you left off — your routes, intentions and saved places are waiting."
      footer={
        <>
          New to Wayheld?{" "}
          <Link
            href="/signup"
            className="font-medium text-brand-btn-primary transition-colors hover:text-brand-btn-primary-hover"
          >
            Create an account
          </Link>
        </>
      }
    >
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
