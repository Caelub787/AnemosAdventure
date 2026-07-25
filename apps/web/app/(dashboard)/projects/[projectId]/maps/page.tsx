import Link from "next/link";
import { requireUser } from "@/lib/auth/getCurrentUser";
import { mapsRepo } from "@arcanavtt/data-access";
import { Card } from "@arcanavtt/ui";
import { CreateMapForm } from "@/components/maps/CreateMapForm";

export default async function MapsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { supabase } = await requireUser();
  const maps = await mapsRepo.listMaps(supabase, projectId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-white">Map Maker</h2>
        <CreateMapForm projectId={projectId} />
      </div>

      {maps.length === 0 ? (
        <p className="text-sm text-slate-400">No maps yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {maps.map((map) => (
            <Link key={map.id} href={`/projects/${projectId}/maps/${map.id}`}>
              <Card className="h-full transition-colors hover:border-violet-600">
                <h3 className="font-medium text-white">{map.name}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {map.width}×{map.height}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
