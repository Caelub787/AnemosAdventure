import type { DbClient } from "../types";
import type { ContentStatus } from "@arcanavtt/db-types";

export async function listContentItems(client: DbClient, filter?: { status?: ContentStatus }) {
  let query = client.from("content_items").select("*").order("updated_at", { ascending: false });
  if (filter?.status) query = query.eq("status", filter.status);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getContentItem(client: DbClient, id: string) {
  const { data, error } = await client.from("content_items").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createContentItem(
  client: DbClient,
  input: { title: string; body?: Record<string, unknown>; type?: string; createdBy: string }
) {
  const { data, error } = await client
    .from("content_items")
    .insert({
      title: input.title,
      body: input.body ?? {},
      type: input.type ?? "announcement",
      created_by: input.createdBy,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateContentItem(
  client: DbClient,
  id: string,
  input: { title?: string; body?: Record<string, unknown> }
) {
  const { data, error } = await client
    .from("content_items")
    .update({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.body !== undefined ? { body: input.body } : {}),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function publishContentItem(client: DbClient, id: string) {
  const { data, error } = await client
    .from("content_items")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function archiveContentItem(client: DbClient, id: string) {
  const { data, error } = await client
    .from("content_items")
    .update({ status: "archived" })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function unpublishToDraft(client: DbClient, id: string) {
  const { data, error } = await client
    .from("content_items")
    .update({ status: "draft", published_at: null })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listContentItemVersions(client: DbClient, contentItemId: string) {
  const { data, error } = await client
    .from("content_item_versions")
    .select("*")
    .eq("content_item_id", contentItemId)
    .order("version", { ascending: false });
  if (error) throw error;
  return data;
}
