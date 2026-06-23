"use client";

import { Suspense } from "react";
import { ResetPasswordContent } from "./content";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
