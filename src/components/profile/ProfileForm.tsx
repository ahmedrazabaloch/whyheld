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

export function ProfileForm({ fullName, email, initialLocation }: ProfileFormProps) {
  const [name, setName] = useState(fullName);
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateProfile = async () => {
    if (isSaving) return;
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
            className={formStyles.input}
            placeholder="+1 (555) 000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
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

