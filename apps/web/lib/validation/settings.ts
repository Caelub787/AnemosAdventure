import { z } from "zod";

export const profileSettingsSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters").max(50),
  avatarUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  notifyMentions: z.boolean(),
  notifyInvitations: z.boolean(),
});

export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>;
