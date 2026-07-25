import { requireUser } from "@/lib/auth/getCurrentUser";
import { contentRepo } from "@arcanavtt/data-access";
import { EditContentItemForm } from "@/components/admin/EditContentItemForm";
import { Card } from "@arcanavtt/ui";

export default async function EditContentItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();

  const [item, versions] = await Promise.all([
    contentRepo.getContentItem(supabase, id),
    contentRepo.listContentItemVersions(supabase, id),
  ]);

  const body = item.body as { text?: string };

  return (
    <div className="flex flex-col gap-8">
      <EditContentItemForm id={id} initialTitle={item.title} initialText={body.text ?? ""} status={item.status} />

      {versions.length > 0 && (
        <div>
          <h2 className="font-medium text-white">Version history</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {versions.map((version) => (
              <li key={version.id}>
                <Card>
                  <p className="text-sm text-slate-200">
                    v{version.version} · {version.title}
                  </p>
                  <p className="text-xs text-slate-500">{new Date(version.created_at).toLocaleString()}</p>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
