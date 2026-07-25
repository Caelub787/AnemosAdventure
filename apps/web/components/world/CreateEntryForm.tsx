"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@arcanavtt/data-access/client";
import { entriesRepo } from "@arcanavtt/data-access";
import { Button } from "@arcanavtt/ui";
import { slugify } from "@/lib/slugify";

export function CreateEntryForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const entryId = await entriesRepo.createWorldEntry(createClient(), {
        projectId,
        title: title.trim(),
        slug: `${slugify(title)}-${Date.now().toString(36)}`,
      });
      router.push(`/projects/${projectId}/world/${entryId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create entry");
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="New entry title"
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
