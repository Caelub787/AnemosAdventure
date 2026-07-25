"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createClient } from "@arcanavtt/data-access/client";
import { invitationsRepo } from "@arcanavtt/data-access";
import { Button } from "@arcanavtt/ui";
import { FormField } from "@/components/forms/FormField";
import { inviteMemberSchema, type InviteMemberInput } from "@/lib/validation/project";

const ROLE_OPTIONS: InviteMemberInput["role"][] = ["administrator", "game_master", "editor", "player", "viewer"];

export function InviteMemberForm({ projectId, invitedBy }: { projectId: string; invitedBy: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteMemberInput>({ resolver: zodResolver(inviteMemberSchema), defaultValues: { role: "player" } });

  async function onSubmit(values: InviteMemberInput) {
    setFormError(null);
    try {
      await invitationsRepo.createInvitation(createClient(), { projectId, invitedBy, ...values });
      reset({ email: "", role: values.role });
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to send invitation");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 sm:flex-row sm:items-end" noValidate>
      <div className="flex-1">
        <FormField label="Invite by email" type="email" error={errors.email?.message} {...register("email")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="role" className="text-sm font-medium text-slate-200">
          Role
        </label>
        <select
          id="role"
          {...register("role")}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
        >
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Inviting…" : "Invite"}
      </Button>
      {formError && (
        <p role="alert" className="text-sm text-red-400">
          {formError}
        </p>
      )}
    </form>
  );
}
