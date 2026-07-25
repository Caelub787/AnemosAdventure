import { requireUser } from "@/lib/auth/getCurrentUser";
import { campaignsRepo, projectsRepo } from "@arcanavtt/data-access";
import { Card } from "@arcanavtt/ui";
import { CampaignLobby } from "@/components/campaigns/CampaignLobby";
import { AddCampaignMemberForm } from "@/components/campaigns/AddCampaignMemberForm";

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ projectId: string; campaignId: string }>;
}) {
  const { projectId, campaignId } = await params;
  const { supabase, user } = await requireUser();

  const [campaign, members, projectMembers, myRole] = await Promise.all([
    campaignsRepo.getCampaign(supabase, campaignId),
    campaignsRepo.listCampaignMembers(supabase, campaignId),
    projectsRepo.listProjectMembers(supabase, projectId),
    projectsRepo.getMyRole(supabase, projectId, user.id),
  ]);

  const canManage = myRole === "owner" || myRole === "administrator" || myRole === "game_master";
  const memberIds = new Set(members.map((m) => m.user_id));
  const candidates = projectMembers
    .filter((m) => !memberIds.has(m.user_id))
    .map((m) => ({ userId: m.user_id, displayName: m.profile?.display_name ?? "Unknown" }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-white">{campaign.name}</h1>
        {campaign.description && <p className="mt-1 text-sm text-slate-400">{campaign.description}</p>}
      </div>

      <CampaignLobby campaignId={campaignId} />

      <div>
        <h2 className="font-medium text-white">Party</h2>
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

      {canManage && (
        <div>
          <h2 className="font-medium text-white">Invite a project member</h2>
          <div className="mt-3">
            <AddCampaignMemberForm campaignId={campaignId} candidates={candidates} />
          </div>
        </div>
      )}
    </div>
  );
}
