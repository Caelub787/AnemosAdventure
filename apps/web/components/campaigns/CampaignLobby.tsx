"use client";

import { createClient } from "@arcanavtt/data-access/client";
import { usePresence } from "@arcanavtt/realtime";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { PresenceAvatars } from "@/components/presence/PresenceAvatars";

export function CampaignLobby({ campaignId }: { campaignId: string }) {
  const { user } = useSupabaseAuth();
  const supabase = createClient();
  const { others } = usePresence(supabase, `campaign:${campaignId}:presence`, {
    userId: user?.id ?? "anonymous",
    displayName: user?.user_metadata?.display_name ?? user?.email ?? "Someone",
  });

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <span className="text-sm text-slate-300">
        {others.length === 0 ? "You're the only one here right now." : `${others.length} other player(s) online`}
      </span>
      <PresenceAvatars users={others} />
    </div>
  );
}
