"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@arcanavtt/data-access/client";
import { Button } from "@arcanavtt/ui";
import { FormField } from "@/components/forms/FormField";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      setFormError(error.message);
      return;
    }

    router.push(searchParams.get("next") ?? "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <h1 className="text-lg font-semibold text-white">Log in</h1>

      <FormField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <FormField
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />

      {formError && (
        <p role="alert" className="text-sm text-red-400">
          {formError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Logging in…" : "Log in"}
      </Button>

      <div className="flex justify-between text-sm text-slate-400">
        <Link href="/reset-password/request" className="hover:text-slate-200">
          Forgot password?
        </Link>
        <Link href="/signup" className="hover:text-slate-200">
          Create account
        </Link>
      </div>
    </form>
  );
}
