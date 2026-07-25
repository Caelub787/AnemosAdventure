import { requireUser } from "@/lib/auth/getCurrentUser";
import { mapsRepo } from "@arcanavtt/data-access";
import { MapCanvas } from "@/components/maps/MapCanvas";

export default async function MapPage({ params }: { params: Promise<{ projectId: string; mapId: string }> }) {
  const { projectId, mapId } = await params;
  const { supabase } = await requireUser();
  const objects = await mapsRepo.listMapObjects(supabase, mapId);

  return (
    <MapCanvas
      projectId={projectId}
      mapId={mapId}
      initialObjects={objects.map((object) => ({
        id: object.id,
        objectType: object.object_type,
        x: Number(object.x),
        y: Number(object.y),
        label: (object.data as { label?: string })?.label ?? "Marker",
      }))}
    />
  );
}
