import type { DbClient } from "../types";

export async function listNotifications(client: DbClient, userId: string) {
  const { data, error } = await client
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

export async function markNotificationRead(client: DbClient, id: string) {
  const { error } = await client
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function createNotification(
  client: DbClient,
  input: { userId: string; type: string; payload?: Record<string, unknown> }
) {
  const { error } = await client
    .from("notifications")
    .insert({ user_id: input.userId, type: input.type, payload: input.payload ?? {} });
  if (error) throw error;
}
