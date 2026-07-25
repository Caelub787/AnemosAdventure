import Link from "next/link";
import { requireUser } from "@/lib/auth/getCurrentUser";
import { entriesRepo } from "@arcanavtt/data-access";
import { Card } from "@arcanavtt/ui";
import { CreateEntryForm } from "@/components/world/CreateEntryForm";

export default async function WorldBuilderPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { supabase } = await requireUser();
  const entries = await entriesRepo.listWorldEntries(supabase, projectId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-white">World Builder</h2>
        <CreateEntryForm projectId={projectId} />
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-slate-400">No entries yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Link key={entry.id} href={`/projects/${projectId}/world/${entry.id}`}>
              <Card className="h-full transition-colors hover:border-violet-600">
                <h3 className="font-medium text-white">{entry.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{entry.content_text || "Empty entry."}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
