"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@arcanavtt/data-access/client";
import { Button } from "@arcanavtt/ui";
import { FormField } from "@/components/forms/FormField";
import { signupSchema, type SignupInput } from "@/lib/validation/auth";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: SignupInput) {
    setFormError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { display_name: values.displayName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      setFormError(error.message);
      return;
    }

    router.push("/verify-email");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <h1 className="text-lg font-semibold text-white">Create your account</h1>

      <FormField label="Display name" autoComplete="nickname" error={errors.displayName?.message} {...register("displayName")} />
      <FormField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <FormField
        label="Password"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />

      {formError && (
        <p role="alert" className="text-sm text-red-400">
          {formError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Sign up"}
      </Button>

      <p className="text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-slate-200 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
