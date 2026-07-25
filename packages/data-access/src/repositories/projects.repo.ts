import type { DbClient } from "../types";
import type { ProjectRole } from "@arcanavtt/db-types";

export async function listMyProjects(client: DbClient) {
  const { data, error } = await client
    .from("project_members")
    .select("role, status, project:projects(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false, referencedTable: "projects" });

  if (error) throw error;
  return data;
}

export async function getProject(client: DbClient, projectId: string) {
  const { data, error } = await client.from("projects").select("*").eq("id", projectId).single();
  if (error) throw error;
  return data;
}

export async function getProjectBySlug(client: DbClient, slug: string) {
  const { data, error } = await client.from("projects").select("*").eq("slug", slug).single();
  if (error) throw error;
  return data;
}

export async function createProject(
  client: DbClient,
  input: { name: string; slug: string; description?: string; ownerId: string }
) {
  const { data: project, error } = await client
    .from("projects")
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      owner_id: input.ownerId,
    })
    .select()
    .single();
  if (error) throw error;

  const { error: memberError } = await client.from("project_members").insert({
    project_id: project.id,
    user_id: input.ownerId,
    role: "owner",
    status: "active",
  });
  if (memberError) throw memberError;

  return project;
}

export async function listProjectMembers(client: DbClient, projectId: string) {
  const { data, error } = await client
    .from("project_members")
    .select("*, profile:profiles(*)")
    .eq("project_id", projectId);
  if (error) throw error;
  return data;
}

export async function getMyRole(client: DbClient, projectId: string, userId: string): Promise<ProjectRole | null> {
  const { data, error } = await client
    .from("project_members")
    .select("role")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw error;
  return data?.role ?? null;
}

export async function updateMemberRole(
  client: DbClient,
  input: { projectId: string; userId: string; role: ProjectRole }
) {
  const { error } = await client
    .from("project_members")
    .update({ role: input.role })
    .eq("project_id", input.projectId)
    .eq("user_id", input.userId);
  if (error) throw error;
}

export async function removeMember(client: DbClient, input: { projectId: string; userId: string }) {
  const { error } = await client
    .from("project_members")
    .update({ status: "removed" })
    .eq("project_id", input.projectId)
    .eq("user_id", input.userId);
  if (error) throw error;
}
