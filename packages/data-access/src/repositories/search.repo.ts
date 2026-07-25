import type { DbClient } from "../types";

/**
 * Global search stub: ILIKE across project_nodes.search_text. RLS already
 * scopes results to projects the caller is a member of, so no extra
 * project-id filtering is required here. Replace with tsvector ranking
 * once search needs to scale beyond a handful of projects per user.
 */
export async function searchProjectNodes(client: DbClient, query: string) {
  const { data, error } = await client
    .from("project_nodes")
    .select("id, project_id, node_type, search_text, updated_at")
    .ilike("search_text", `%${query}%`)
    .is("deleted_at", null)
    .limit(25);
  if (error) throw error;
  return data;
}
