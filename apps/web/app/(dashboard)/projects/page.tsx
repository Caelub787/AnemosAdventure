import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/getCurrentUser";
import { projectsRepo } from "@arcanavtt/data-access";
import { Card } from "@arcanavtt/ui";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const { supabase } = await requireUser();
  const memberships = await projectsRepo.listMyProjects(supabase);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Projects</h1>
        <Link href="/projects/new" className="text-sm text-violet-400 hover:underline">
          New project
        </Link>
      </div>

      {memberships.length === 0 ? (
        <p className="text-sm text-slate-400">No projects yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {memberships.map((membership) => (
            <Link key={membership.project.id} href={`/projects/${membership.project.id}`}>
              <Card className="h-full transition-colors hover:border-violet-600">
                <h2 className="font-medium text-white">{membership.project.name}</h2>
                {membership.project.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-400">{membership.project.description}</p>
                )}
                <p className="mt-2 text-xs text-slate-500">Role: {membership.role}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
