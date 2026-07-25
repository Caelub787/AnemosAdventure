import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

const ROLE_RANK: Record<string, number> = {
  owner: 6,
  administrator: 5,
  game_master: 4,
  editor: 3,
  player: 2,
  viewer: 1,
};

export function roleRank(role: string | null): number {
  return role ? (ROLE_RANK[role] ?? 0) : 0;
}

/** Resolves the owning project id for a `entry:{id}` or `map:{id}` doc name. */
export async function resolveProjectIdForDoc(documentName: string): Promise<string | null> {
  const [kind, id] = documentName.split(":");
  if (!id) return null;

  const table = kind === "entry" ? "world_builder_entries" : kind === "map" ? "maps" : null;
  if (!table) return null;

  const result = await pool.query<{ project_id: string }>(
    `select project_id from ${table} where id = $1`,
    [id]
  );
  return result.rows[0]?.project_id ?? null;
}

export async function getProjectRole(projectId: string, userId: string): Promise<string | null> {
  const result = await pool.query<{ role: string }>(
    `select role from project_members where project_id = $1 and user_id = $2 and status = 'active'`,
    [projectId, userId]
  );
  return result.rows[0]?.role ?? null;
}
