import Link from "next/link";
import { requireUser } from "@/lib/auth/getCurrentUser";
import { campaignsRepo } from "@arcanavtt/data-access";
import { Card } from "@arcanavtt/ui";
import { CreateCampaignForm } from "@/components/campaigns/CreateCampaignForm";

export default async function CampaignsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { supabase } = await requireUser();
  const campaigns = await campaignsRepo.listCampaigns(supabase, projectId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-white">Campaigns</h2>
        <CreateCampaignForm projectId={projectId} />
      </div>

      {campaigns.length === 0 ? (
        <p className="text-sm text-slate-400">No campaigns yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Link key={campaign.id} href={`/projects/${projectId}/campaigns/${campaign.id}`}>
              <Card className="h-full transition-colors hover:border-violet-600">
                <h3 className="font-medium text-white">{campaign.name}</h3>
                {campaign.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{campaign.description}</p>
                )}
                <p className="mt-2 text-xs text-slate-500">{campaign.status}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
