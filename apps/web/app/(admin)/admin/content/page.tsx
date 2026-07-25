import Link from "next/link";
import { requireUser } from "@/lib/auth/getCurrentUser";
import { contentRepo } from "@arcanavtt/data-access";
import { Card } from "@arcanavtt/ui";

const STATUS_COLOR: Record<string, string> = {
  draft: "text-slate-400",
  published: "text-emerald-400",
  archived: "text-slate-600",
};

export default async function AdminContentPage() {
  const { supabase } = await requireUser();
  const items = await contentRepo.listContentItems(supabase);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Content</h2>
        <Link href="/admin/content/new" className="text-sm text-violet-400 hover:underline">
          New item
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-400">No content items yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <Link key={item.id} href={`/admin/content/${item.id}`}>
              <Card className="flex items-center justify-between transition-colors hover:border-violet-600">
                <div>
                  <h3 className="font-medium text-white">{item.title}</h3>
                  <p className="text-xs text-slate-500">{item.type} · v{item.version}</p>
                </div>
                <span className={`text-xs font-medium ${STATUS_COLOR[item.status]}`}>{item.status}</span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
