"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createClient } from "@arcanavtt/data-access/client";
import { Button } from "@arcanavtt/ui";
import { FormField } from "@/components/forms/FormField";
import { confirmResetSchema, type ConfirmResetInput } from "@/lib/validation/auth";

export function ConfirmResetForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConfirmResetInput>({ resolver: zodResolver(confirmResetSchema) });

  async function onSubmit(values: ConfirmResetInput) {
    setFormError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: values.password });

    if (error) {
      setFormError(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <h1 className="text-lg font-semibold text-white">Choose a new password</h1>

      <FormField
        label="New password"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <FormField
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      {formError && (
        <p role="alert" className="text-sm text-red-400">
          {formError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save new password"}
      </Button>
    </form>
  );
}
