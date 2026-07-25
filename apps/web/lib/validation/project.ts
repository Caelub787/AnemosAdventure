import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createProjectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(60)
    .regex(slugPattern, "Use lowercase letters, numbers, and hyphens only"),
  description: z.string().max(500).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const inviteMemberSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  role: z.enum(["administrator", "game_master", "editor", "player", "viewer"]),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
