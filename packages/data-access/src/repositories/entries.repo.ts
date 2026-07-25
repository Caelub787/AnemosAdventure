import type { DbClient } from "../types";

export async function createWorldEntry(client: DbClient, input: { projectId: string; title: string; slug: string }) {
  const { data, error } = await client.rpc("create_world_entry", {
    p_project_id: input.projectId,
    p_title: input.title,
    p_slug: input.slug,
  });
  if (error) throw error;
  return data as unknown as string;
}

export async function listWorldEntries(client: DbClient, projectId: string) {
  const { data, error } = await client
    .from("world_builder_entries")
    .select("*")
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getWorldEntry(client: DbClient, entryId: string) {
  const { data, error } = await client.from("world_builder_entries").select("*").eq("id", entryId).single();
  if (error) throw error;
  return data;
}

export async function updateWorldEntry(
  client: DbClient,
  entryId: string,
  input: { title?: string; contentText?: string }
) {
  const { error } = await client
    .from("world_builder_entries")
    .update({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.contentText !== undefined ? { content_text: input.contentText } : {}),
    })
    .eq("id", entryId);
  if (error) throw error;
}

export async function replaceEntryLinks(
  client: DbClient,
  input: { projectId: string; sourceEntryId: string; links: { linkText: string; targetNodeId: string | null }[] }
) {
  const { error: deleteError } = await client
    .from("entry_links")
    .delete()
    .eq("source_entry_id", input.sourceEntryId);
  if (deleteError) throw deleteError;

  if (input.links.length === 0) return;

  const { error: insertError } = await client.from("entry_links").insert(
    input.links.map((link) => ({
      project_id: input.projectId,
      source_entry_id: input.sourceEntryId,
      target_node_id: link.targetNodeId,
      link_text: link.linkText,
    }))
  );
  if (insertError) throw insertError;
}

export async function listBacklinks(client: DbClient, targetNodeId: string) {
  const { data, error } = await client
    .from("entry_links")
    .select("*, source:project_nodes!entry_links_source_entry_id_fkey(id)")
    .eq("target_node_id", targetNodeId);
  if (error) throw error;
  return data;
}

/** Resolve `[[Title]]` wiki-links within a project to their node id, if any match exists. */
export async function resolveLinkTargets(client: DbClient, projectId: string, titles: string[]) {
  if (titles.length === 0) return new Map<string, string>();

  const { data, error } = await client
    .from("world_builder_entries")
    .select("id, title")
    .eq("project_id", projectId)
    .in("title", titles);
  if (error) throw error;

  return new Map(data.map((entry) => [entry.title, entry.id]));
}
