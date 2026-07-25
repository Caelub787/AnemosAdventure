"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@arcanavtt/data-access/client";
import { campaignsRepo } from "@arcanavtt/data-access";
import { Button } from "@arcanavtt/ui";
import type { CampaignMemberRole } from "@arcanavtt/db-types";

interface Candidate {
  userId: string;
  displayName: string;
}

export function AddCampaignMemberForm({ campaignId, candidates }: { campaignId: string; candidates: Candidate[] }) {
  const router = useRouter();
  const [userId, setUserId] = useState(candidates[0]?.userId ?? "");
  const [role, setRole] = useState<CampaignMemberRole>("player");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (candidates.length === 0) return null;

  async function handleAdd() {
    setLoading(true);
    setError(null);
    try {
      await campaignsRepo.addCampaignMember(createClient(), { campaignId, userId, role });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={userId}
        onChange={(event) => setUserId(event.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100"
      >
        {candidates.map((candidate) => (
          <option key={candidate.userId} value={candidate.userId}>
            {candidate.displayName}
          </option>
        ))}
      </select>
      <select
        value={role}
        onChange={(event) => setRole(event.target.value as CampaignMemberRole)}
        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100"
      >
        <option value="player">player</option>
        <option value="game_master">game_master</option>
      </select>
      <Button size="sm" onClick={handleAdd} disabled={loading}>
        {loading ? "Adding…" : "Add to campaign"}
      </Button>
      {error && (
        <span role="alert" className="text-xs text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}
