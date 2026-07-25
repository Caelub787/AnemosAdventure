import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/getCurrentUser";
import { projectsRepo } from "@arcanavtt/data-access";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { supabase, user } = await requireUser();

  const [project, role] = await Promise.all([
    projectsRepo.getProject(supabase, projectId).catch(() => null),
    projectsRepo.getMyRole(supabase, projectId, user.id),
  ]);

  if (!project || !role) notFound();

  const tabs = [
    { href: `/projects/${projectId}`, label: "Overview" },
    { href: `/projects/${projectId}/world`, label: "World Builder" },
    { href: `/projects/${projectId}/maps`, label: "Map Maker" },
    { href: `/projects/${projectId}/campaigns`, label: "Campaigns" },
    { href: `/projects/${projectId}/members`, label: "Members" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-white">{project.name}</h1>
        <nav aria-label="Project sections" className="mt-3 flex gap-4 overflow-x-auto border-b border-slate-800 text-sm">
          {tabs.map((tab) => (
            <Link key={tab.href} href={tab.href} className="whitespace-nowrap px-1 pb-2 text-slate-300 hover:text-white">
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
