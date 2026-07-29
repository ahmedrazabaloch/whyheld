"use client";

import { useState } from "react";
import { toast } from "sonner";
import { formStyles, buttonStyles } from "@/lib/design";

export function SecurityForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Security settings updated successfully.");
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div className="space-y-2">
        <label className={formStyles.label}>Current Password</label>
        <input
          type="password"
          className={formStyles.input}
          placeholder="••••••••"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className={formStyles.label}>New Password</label>
        <input
          type="password"
          className={formStyles.input}
          placeholder="••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className={formStyles.label}>Confirm New Password</label>
        <input
          type="password"
          className={formStyles.input}
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isUpdating}
          className={`${buttonStyles.secondary}`}
        >
          {isUpdating ? "Updating..." : "Change Password"}
        </button>
      </div>
    </form>
  );
}
