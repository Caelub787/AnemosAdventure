"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@arcanavtt/data-access/client";
import { Button } from "@arcanavtt/ui";
import { FormField } from "@/components/forms/FormField";
import { requestResetSchema, type RequestResetInput } from "@/lib/validation/auth";

export function RequestResetForm() {
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestResetInput>({ resolver: zodResolver(requestResetSchema) });

  async function onSubmit(values: RequestResetInput) {
    setFormError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password/confirm`,
    });

    if (error) {
      setFormError(error.message);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <p className="text-sm text-slate-400">
        If an account exists for that email, we&apos;ve sent a password reset link.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <h1 className="text-lg font-semibold text-white">Reset your password</h1>

      <FormField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />

      {formError && (
        <p role="alert" className="text-sm text-red-400">
          {formError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
