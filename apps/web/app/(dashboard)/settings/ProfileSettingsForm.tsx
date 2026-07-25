"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@arcanavtt/data-access/client";
import { profilesRepo } from "@arcanavtt/data-access";
import { Button } from "@arcanavtt/ui";
import { FormField } from "@/components/forms/FormField";
import { profileSettingsSchema, type ProfileSettingsInput } from "@/lib/validation/settings";

export function ProfileSettingsForm({
  userId,
  initial,
}: {
  userId: string;
  initial: ProfileSettingsInput;
}) {
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileSettingsInput>({ resolver: zodResolver(profileSettingsSchema), defaultValues: initial });

  async function onSubmit(values: ProfileSettingsInput) {
    setFormError(null);
    setSaved(false);
    try {
      await profilesRepo.updateProfile(createClient(), userId, {
        displayName: values.displayName,
        avatarUrl: values.avatarUrl || null,
        notificationSettings: { mentions: values.notifyMentions, invitations: values.notifyInvitations },
      });
      setSaved(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save settings");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <FormField label="Display name" error={errors.displayName?.message} {...register("displayName")} />
      <FormField label="Avatar URL" error={errors.avatarUrl?.message} {...register("avatarUrl")} />

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-slate-200">Notifications</legend>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" {...register("notifyMentions")} />
          Notify me when someone mentions me
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" {...register("notifyInvitations")} />
          Notify me about project and campaign invitations
        </label>
      </fieldset>

      {formError && (
        <p role="alert" className="text-sm text-red-400">
          {formError}
        </p>
      )}
      {saved && <p className="text-sm text-emerald-400">Settings saved.</p>}

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
