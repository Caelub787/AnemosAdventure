"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@arcanavtt/data-access/client";
import { mapsRepo } from "@arcanavtt/data-access";
import { Button } from "@arcanavtt/ui";

export function CreateMapForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const mapId = await mapsRepo.createMap(createClient(), { projectId, name: name.trim() });
      router.push(`/projects/${projectId}/maps/${mapId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create map");
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="New map name"
        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100"
      />
      <Button size="sm" onClick={handleCreate} disabled={loading}>
        {loading ? "Creating…" : "Create"}
      </Button>
      {error && (
        <span role="alert" className="text-xs text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}
