"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@arcanavtt/data-access/client";
import { invitationsRepo } from "@arcanavtt/data-access";
import { Button } from "@arcanavtt/ui";

export function AcceptInvitationButton({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setLoading(true);
    setError(null);
    try {
      const projectId = await invitationsRepo.acceptInvitation(createClient(), token);
      router.push(`/projects/${projectId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept invitation");
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span role="alert" className="text-xs text-red-400">
          {error}
        </span>
      )}
      <Button size="sm" onClick={handleAccept} disabled={loading}>
        {loading ? "Joining…" : "Accept"}
      </Button>
    </div>
  );
}
