import type { DbClient } from "../types";
import type { ProjectRole } from "@arcanavtt/db-types";

export async function createInvitation(
  client: DbClient,
  input: { projectId: string; email: string; role: Exclude<ProjectRole, "owner">; invitedBy: string }
) {
  const { data, error } = await client
    .from("invitations")
    .insert({
      project_id: input.projectId,
      email: input.email.toLowerCase(),
      role: input.role,
      invited_by: input.invitedBy,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listPendingInvitations(client: DbClient, projectId: string) {
  const { data, error } = await client
    .from("invitations")
    .select("*")
    .eq("project_id", projectId)
    .eq("status", "pending");
  if (error) throw error;
  return data;
}

/** Invitations addressed to the signed-in user's own email, regardless of project role. */
export async function listMyInvitations(client: DbClient, email: string) {
  const { data, error } = await client
    .from("invitations")
    .select("*, project:projects(name, slug)")
    .eq("status", "pending")
    .ilike("email", email);
  if (error) throw error;
  return data;
}

export async function revokeInvitation(client: DbClient, invitationId: string) {
  const { error } = await client.from("invitations").update({ status: "revoked" }).eq("id", invitationId);
  if (error) throw error;
}

/** Preview an invitation from its token without needing table-level SELECT access. */
export async function getInvitationPreview(client: DbClient, token: string) {
  const { data, error } = await client.rpc("get_invitation_preview", { p_token: token });
  if (error) throw error;
  return data?.[0] ?? null;
}

/** Accept an invitation as the currently signed-in user (email must match). */
export async function acceptInvitation(client: DbClient, token: string): Promise<string> {
  const { data, error } = await client.rpc("accept_invitation", { p_token: token });
  if (error) throw error;
  return data as unknown as string;
}
