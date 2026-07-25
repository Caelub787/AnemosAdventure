import type { DbClient } from "../types";

/**
 * Relies on the `admin_users` RLS policy (`using (is_admin())`) to return zero
 * rows for non-admins rather than erroring, so this doubles as a safe
 * boolean check without a separate RPC.
 */
export async function isCurrentUserAdmin(client: DbClient, userId: string): Promise<boolean> {
  const { data, error } = await client.from("admin_users").select("user_id").eq("user_id", userId);
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}
