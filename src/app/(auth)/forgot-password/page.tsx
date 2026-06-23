import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset your password — Wayheld",
  description: "Request a secure link to reset your Wayheld password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Password reset"
      title="Let's get you back in."
      subtitle="Enter the email tied to your account and we'll send a secure link to set a new password."
      footer={
        <>
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-medium text-brand-btn-primary transition-colors hover:text-brand-btn-primary-hover"
          >
            Sign in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
