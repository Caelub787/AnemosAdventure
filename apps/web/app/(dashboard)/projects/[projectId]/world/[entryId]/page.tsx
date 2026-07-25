import { requireUser } from "@/lib/auth/getCurrentUser";
import { entriesRepo } from "@arcanavtt/data-access";
import { WorldEntryEditor } from "@/components/world/WorldEntryEditor";

export default async function WorldEntryPage({
  params,
}: {
  params: Promise<{ projectId: string; entryId: string }>;
}) {
  const { projectId, entryId } = await params;
  const { supabase } = await requireUser();
  const entry = await entriesRepo.getWorldEntry(supabase, entryId);

  return <WorldEntryEditor projectId={projectId} entryId={entryId} initialTitle={entry.title} />;
}
