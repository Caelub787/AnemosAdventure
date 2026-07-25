"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createClient } from "@arcanavtt/data-access/client";
import { projectsRepo } from "@arcanavtt/data-access";
import { Button } from "@arcanavtt/ui";
import { FormField } from "@/components/forms/FormField";
import { createProjectSchema, type CreateProjectInput } from "@/lib/validation/project";
import { slugify } from "@/lib/slugify";

export function CreateProjectForm({ ownerId }: { ownerId: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectInput>({ resolver: zodResolver(createProjectSchema) });

  async function onSubmit(values: CreateProjectInput) {
    setFormError(null);
    try {
      const project = await projectsRepo.createProject(createClient(), { ...values, ownerId });
      router.push(`/projects/${project.id}`);
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create project");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <FormField
        label="Project name"
        error={errors.name?.message}
        {...register("name", {
          onChange: (event) => {
            if (!getValues("slug")) setValue("slug", slugify(event.target.value));
          },
        })}
      />
      <FormField label="Slug" error={errors.slug?.message} {...register("slug")} />
      <FormField label="Description (optional)" error={errors.description?.message} {...register("description")} />

      {formError && (
        <p role="alert" className="text-sm text-red-400">
          {formError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating…" : "Create project"}
      </Button>
    </form>
  );
}
