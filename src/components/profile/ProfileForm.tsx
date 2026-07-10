"use client";

import { useState } from "react";
import { toast } from "sonner";
import { formStyles, buttonStyles } from "@/lib/design";
import { LocationForm } from "@/components/location/LocationForm";

interface ProfileFormProps {
  fullName: string;
  email: string;
  initialLocation: string;
}

/** Strips all non-digit characters to get the raw digit count. */
function extractDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function validatePhone(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed === "") return null; // Phone is optional — empty is valid.
  const digits = extractDigits(trimmed);
  if (digits.length === 0) return "Phone number must contain digits only.";
  if (/[a-zA-Z]/.test(trimmed)) return "Phone number must not contain letters.";
  if (digits.length < 7) return "Phone number must be at least 7 digits.";
  if (digits.length > 15) return "Phone number must be no more than 15 digits.";
  return null;
}

export function ProfileForm({ fullName, email, initialLocation }: ProfileFormProps) {
  const [name, setName] = useState(fullName);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    // Clear error on change to give live feedback
    if (phoneError) {
      setPhoneError(validatePhone(value));
    }
  };

  const handlePhoneBlur = () => {
    setPhoneError(validatePhone(phone));
  };

  const handleUpdateProfile = async () => {
    if (isSaving) return;

    // Run phone validation before submission
    const phoneValidationError = validatePhone(phone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      toast.error(phoneValidationError);
      return;
    }

    setIsSaving(true);
    // Profile name/phone update is a future action — stub with toast feedback
    await new Promise((r) => setTimeout(r, 800));
    setIsSaving(false);
    toast.success("Profile updated successfully.");
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); }}
      className="flex-1 space-y-8"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className={formStyles.label}>Full Name</label>
          <input
            type="text"
            className={formStyles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="space-y-2">
          <label className={formStyles.label}>Email</label>
          <input
            type="email"
            className={formStyles.input}
            defaultValue={email}
            disabled
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className={formStyles.label}>Phone</label>
          <input
            type="tel"
            className={`${formStyles.input} ${phoneError ? "border-red-400 focus:border-red-400 focus-visible:outline-red-400" : ""}`}
            placeholder="+1 555 000 0000"
            value={phone}
            onChange={handlePhoneChange}
            onBlur={handlePhoneBlur}
            inputMode="tel"
          />
          {phoneError && (
            <p className="text-xs text-red-500" role="alert">
              {phoneError}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <LocationForm initialLocation={initialLocation} />
        </div>
      </div>

      <div className="pt-4 text-right">
        <button
          type="submit"
          disabled={isSaving}
          className={buttonStyles.primary}
        >
          {isSaving ? "Saving…" : "Update Profile"}
        </button>
      </div>
    </form>
  );
}
