import Link from "next/link";
import { requireUser } from "@/lib/auth/getCurrentUser";
import { entriesRepo, mapsRepo, campaignsRepo } from "@arcanavtt/data-access";
import { Card } from "@arcanavtt/ui";

export default async function ProjectOverviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { supabase } = await requireUser();

  const [entries, maps, campaigns] = await Promise.all([
    entriesRepo.listWorldEntries(supabase, projectId),
    mapsRepo.listMaps(supabase, projectId),
    campaignsRepo.listCampaigns(supabase, projectId),
  ]);

  const sections = [
    { title: "World Builder entries", href: `/projects/${projectId}/world`, items: entries.map((e) => e.title) },
    { title: "Maps", href: `/projects/${projectId}/maps`, items: maps.map((m) => m.name) },
    { title: "Campaigns", href: `/projects/${projectId}/campaigns`, items: campaigns.map((c) => c.name) },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {sections.map((section) => (
        <Card key={section.href}>
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-white">{section.title}</h2>
            <Link href={section.href} className="text-xs text-violet-400 hover:underline">
              View all
            </Link>
          </div>
          {section.items.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">None yet.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-300">
              {section.items.slice(0, 5).map((name) => (
                <li key={name} className="truncate">
                  {name}
                </li>
              ))}
            </ul>
          )}
        </Card>
      ))}
    </div>
  );
}
