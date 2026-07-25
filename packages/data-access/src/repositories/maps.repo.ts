import type { DbClient } from "../types";
import type { MapObjectType } from "@arcanavtt/db-types";

export async function createMap(client: DbClient, input: { projectId: string; name: string }) {
  const { data, error } = await client.rpc("create_map", { p_project_id: input.projectId, p_name: input.name });
  if (error) throw error;
  return data as unknown as string;
}

export async function listMaps(client: DbClient, projectId: string) {
  const { data, error } = await client
    .from("maps")
    .select("*")
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getMap(client: DbClient, mapId: string) {
  const { data, error } = await client.from("maps").select("*").eq("id", mapId).single();
  if (error) throw error;
  return data;
}

export async function listMapObjects(client: DbClient, mapId: string) {
  const { data, error } = await client.from("map_objects").select("*").eq("map_id", mapId);
  if (error) throw error;
  return data;
}

export async function upsertMapObject(
  client: DbClient,
  input: {
    id?: string;
    mapId: string;
    objectType: MapObjectType;
    x: number;
    y: number;
    layerId?: string;
    data?: Record<string, unknown>;
    createdBy: string;
  }
) {
  const { data, error } = await client
    .from("map_objects")
    .upsert({
      ...(input.id ? { id: input.id } : {}),
      map_id: input.mapId,
      object_type: input.objectType,
      x: input.x,
      y: input.y,
      layer_id: input.layerId ?? "default",
      data: input.data ?? {},
      created_by: input.createdBy,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMapObject(client: DbClient, objectId: string) {
  const { error } = await client.from("map_objects").delete().eq("id", objectId);
  if (error) throw error;
}
