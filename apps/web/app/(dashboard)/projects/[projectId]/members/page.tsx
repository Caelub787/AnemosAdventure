import { requireUser } from "@/lib/auth/getCurrentUser";
import { projectsRepo, invitationsRepo } from "@arcanavtt/data-access";
import { Card } from "@arcanavtt/ui";
import { InviteMemberForm } from "./InviteMemberForm";

export default async function MembersPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { supabase, user } = await requireUser();

  const role = await projectsRepo.getMyRole(supabase, projectId, user.id);
  const canManage = role === "owner" || role === "administrator";

  const [members, pendingInvitations] = await Promise.all([
    projectsRepo.listProjectMembers(supabase, projectId),
    canManage ? invitationsRepo.listPendingInvitations(supabase, projectId) : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {canManage && (
        <Card>
          <h2 className="font-medium text-white">Invite a collaborator</h2>
          <div className="mt-3">
            <InviteMemberForm projectId={projectId} invitedBy={user.id} />
          </div>
        </Card>
      )}

      <div>
        <h2 className="font-medium text-white">Members</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {members.map((member) => (
            <li key={member.id}>
              <Card className="flex items-center justify-between">
                <span className="text-sm text-slate-200">{member.profile?.display_name}</span>
                <span className="text-xs text-slate-500">{member.role}</span>
              </Card>
            </li>
          ))}
        </ul>
      </div>

      {canManage && pendingInvitations.length > 0 && (
        <div>
          <h2 className="font-medium text-white">Pending invitations</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {pendingInvitations.map((invitation) => (
              <li key={invitation.id}>
                <Card className="flex items-center justify-between">
                  <span className="text-sm text-slate-200">{invitation.email}</span>
                  <span className="text-xs text-slate-500">{invitation.role}</span>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
