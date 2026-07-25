import type { DbClient } from "../types";

export async function getProfile(client: DbClient, userId: string) {
  const { data, error } = await client.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
}

export async function updateProfile(
  client: DbClient,
  userId: string,
  input: {
    displayName?: string;
    avatarUrl?: string | null;
    notificationSettings?: Record<string, unknown>;
    privacySettings?: Record<string, unknown>;
  }
) {
  const { error } = await client
    .from("profiles")
    .update({
      ...(input.displayName !== undefined ? { display_name: input.displayName } : {}),
      ...(input.avatarUrl !== undefined ? { avatar_url: input.avatarUrl } : {}),
      ...(input.notificationSettings !== undefined ? { notification_settings: input.notificationSettings } : {}),
      ...(input.privacySettings !== undefined ? { privacy_settings: input.privacySettings } : {}),
    })
    .eq("id", userId);
  if (error) throw error;
}
