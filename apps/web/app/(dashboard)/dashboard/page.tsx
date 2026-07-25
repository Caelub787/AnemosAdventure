import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/getCurrentUser";
import { projectsRepo, invitationsRepo, notificationsRepo, contentRepo } from "@arcanavtt/data-access";
import { Card } from "@arcanavtt/ui";
import { AcceptInvitationButton } from "@/components/invitations/AcceptInvitationButton";
import { AnnouncementsWidget } from "@/components/admin/AnnouncementsWidget";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();

  const [memberships, invitations, notifications, announcements] = await Promise.all([
    projectsRepo.listMyProjects(supabase),
    user.email ? invitationsRepo.listMyInvitations(supabase, user.email) : Promise.resolve([]),
    notificationsRepo.listNotifications(supabase, user.id),
    contentRepo.listContentItems(supabase, { status: "published" }),
  ]);

  const mostRecentProject = memberships[0]?.project;
  const tiles = [
    { label: "World Builder", section: "world", description: "Write and link lore, characters, and locations." },
    { label: "Map Maker", section: "maps", description: "Draw regional, city, and battle maps." },
    { label: "Campaigns", section: "campaigns", description: "Run live sessions with your table." },
  ] as const;

  return (
    <div className="flex flex-col gap-8">
      <AnnouncementsWidget
        initial={announcements.map((item) => ({ id: item.id, title: item.title, status: item.status }))}
      />

      <section>
        <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
        <p className="mt-1 text-slate-400">Jump into your world, your maps, or your table.</p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {tiles.map((tile) => (
            <Link
              key={tile.section}
              href={mostRecentProject ? `/projects/${mostRecentProject.id}/${tile.section}` : "/projects/new"}
              className="block rounded-xl border border-slate-800 bg-slate-900/60 p-6 transition-colors hover:border-violet-600 hover:bg-slate-900"
            >
              <h2 className="text-lg font-semibold text-white">{tile.label}</h2>
              <p className="mt-1 text-sm text-slate-400">{tile.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {invitations.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white">Invitations</h2>
          <div className="mt-3 flex flex-col gap-2">
            {invitations.map((invitation) => (
              <Card key={invitation.id} className="flex items-center justify-between">
                <span className="text-sm text-slate-200">
                  Join <strong>{invitation.project?.name}</strong> as {invitation.role}
                </span>
                <AcceptInvitationButton token={invitation.token} />
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Your projects</h2>
          <Link
            href="/projects/new"
            className="inline-flex items-center justify-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700"
          >
            Quick-create project
          </Link>
        </div>

        {memberships.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">
            You&apos;re not part of any projects yet. <Link href="/projects/new" className="underline">Create one</Link> to get started.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {memberships.map((membership) => (
              <Link key={membership.project.id} href={`/projects/${membership.project.id}`}>
                <Card className="transition-colors hover:border-violet-600">
                  <h3 className="font-medium text-white">{membership.project.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">Role: {membership.role}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Recent notifications</h2>
        {notifications.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">Nothing new.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {notifications.slice(0, 5).map((notification) => (
              <li key={notification.id}>
                <Card className={notification.read_at ? "opacity-60" : undefined}>
                  <p className="text-sm text-slate-200">{notification.type}</p>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
