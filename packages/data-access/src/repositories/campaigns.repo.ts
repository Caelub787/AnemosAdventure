import type { DbClient } from "../types";
import type { CampaignMemberRole } from "@arcanavtt/db-types";

export async function createCampaign(
  client: DbClient,
  input: { projectId: string; name: string; description?: string }
) {
  const { data, error } = await client.rpc("create_campaign", {
    p_project_id: input.projectId,
    p_name: input.name,
    p_description: input.description ?? null,
  });
  if (error) throw error;
  return data as unknown as string;
}

export async function listCampaigns(client: DbClient, projectId: string) {
  const { data, error } = await client
    .from("campaigns")
    .select("*")
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCampaign(client: DbClient, campaignId: string) {
  const { data, error } = await client.from("campaigns").select("*").eq("id", campaignId).single();
  if (error) throw error;
  return data;
}

export async function listCampaignMembers(client: DbClient, campaignId: string) {
  const { data, error } = await client
    .from("campaign_members")
    .select("*, profile:profiles(*)")
    .eq("campaign_id", campaignId);
  if (error) throw error;
  return data;
}

export async function addCampaignMember(
  client: DbClient,
  input: { campaignId: string; userId: string; role: CampaignMemberRole }
) {
  const { error } = await client
    .from("campaign_members")
    .insert({ campaign_id: input.campaignId, user_id: input.userId, role: input.role });
  if (error) throw error;
}
