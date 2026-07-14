"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { formStyles, buttonStyles } from "@/lib/design";
import { LocationForm } from "@/components/location/LocationForm";
import { updateProfileDetails } from "@/actions/profile-actions";
import { parsePhoneNumber, AsYouType, getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js";

interface ProfileFormProps {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  initialLocation: string;
}

// Map location strings to 2-letter ISO country codes
function inferCountryCode(locationString: string): CountryCode | undefined {
  if (!locationString) return undefined;
  const parts = locationString.split(",");
  const possibleCountryName = parts[parts.length - 1].trim();
  
  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
  const countries = getCountries();
  for (const code of countries) {
    try {
      const name = regionNames.of(code);
      if (name && name.toLowerCase() === possibleCountryName.toLowerCase()) {
        return code;
      }
    } catch (e) {}
  }
  
  const fallbacks: Record<string, CountryCode> = {
    "united states": "US",
    "usa": "US",
    "united kingdom": "GB",
    "uk": "GB",
    "great britain": "GB",
  };
  return fallbacks[possibleCountryName.toLowerCase()];
}

function validatePhone(value: string, country?: CountryCode): string | null {
  const trimmed = value.trim();
  if (trimmed === "") return null; // Phone is optional
  try {
    const parsed = parsePhoneNumber(trimmed, country);
    if (!parsed.isValid()) {
      return `Invalid phone number${country ? " for the selected country" : ""}.`;
    }
    return null;
  } catch (error) {
    return "Invalid phone number format.";
  }
}

export function ProfileForm({ firstName, lastName, phone: initialPhone, email, initialLocation }: ProfileFormProps) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const [name, setName] = useState(fullName);
  
  const [country, setCountry] = useState<CountryCode | undefined>(() => {
    if (initialPhone) {
      try {
        const parsed = parsePhoneNumber(initialPhone);
        if (parsed.country) return parsed.country;
      } catch {}
    }
    return inferCountryCode(initialLocation);
  });

  const [phone, setPhone] = useState(() => {
    if (!initialPhone) return "";
    try {
      const parsed = parsePhoneNumber(initialPhone);
      return parsed.formatNational();
    } catch {
      return initialPhone;
    }
  });

  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-update country if location changes and phone hasn't explicitly been pinned to another country
  useEffect(() => {
    const inferred = inferCountryCode(initialLocation);
    if (inferred && (!phone || phone.trim() === "")) {
      setCountry(inferred);
    }
  }, [initialLocation, phone]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = (e.target.value as CountryCode) || undefined;
    setCountry(newCountry);
    const asYouType = new AsYouType(newCountry);
    const formatted = asYouType.input(phone);
    setPhone(formatted);
    if (phoneError) setPhoneError(validatePhone(formatted, newCountry));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const asYouType = new AsYouType(country);
    const formatted = asYouType.input(value);
    setPhone(formatted);
    if (phoneError) setPhoneError(validatePhone(formatted, country));
  };

  const handlePhoneBlur = () => {
    setPhoneError(validatePhone(phone, country));
  };

  const handleUpdateProfile = async () => {
    if (isSaving) return;

    const phoneValidationError = validatePhone(phone, country);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      toast.error(phoneValidationError);
      return;
    }

    setIsSaving(true);
    
    let e164Phone = null;
    if (phone.trim() !== "") {
      try {
        const parsed = parsePhoneNumber(phone, country);
        e164Phone = parsed.format("E.164");
      } catch (e) {}
    }

    const nameParts = name.trim().split(" ");
    const submittedFirstName = nameParts[0] || "";
    const submittedLastName = nameParts.slice(1).join(" ") || null;

    try {
      const response = await updateProfileDetails({
        firstName: submittedFirstName,
        lastName: submittedLastName,
        phone: e164Phone,
      });

      if (response.success) {
        toast.success("Profile updated successfully.");
      } else {
        toast.error(response.error || "Failed to update profile.");
      }
    } catch (e) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
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
          <div className="flex gap-2">
            <select
              className={`${formStyles.input} w-[110px] shrink-0 text-sm px-2`}
              value={country || ""}
              onChange={handleCountryChange}
            >
              <option value="">Intl</option>
              {getCountries().map((c) => (
                <option key={c} value={c}>
                  {c} +{getCountryCallingCode(c)}
                </option>
              ))}
            </select>
            <input
              type="tel"
              className={`${formStyles.input} w-full ${phoneError ? "border-red-400 focus:border-red-400 focus-visible:outline-red-400" : ""}`}
              placeholder="(555) 000-0000"
              value={phone}
              onChange={handlePhoneChange}
              onBlur={handlePhoneBlur}
              inputMode="tel"
            />
          </div>
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
